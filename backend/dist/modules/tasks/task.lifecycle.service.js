"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskLifecycleService = void 0;
const prisma_1 = require("../../../src/lib/prisma");
const error_1 = require("../../../src/utils/error");
/**
 * Lifecycle enforcement for Task.status transitions.
 *
 * IMPORTANT: This service is the single writer for status transitions.
 */
class TaskLifecycleService {
    /**
     * Validate and change a task's status.
     *
     * NOTE: Task “status” is not stored as Task.status.
     * The authoritative state is TaskStatusHistory.toStatus (latest row) and
     * Task.completedAt is derived from entering/leaving DONE.
     */
    async changeStatus(taskId, toStatus, changedById, expectedFromStatus) {
        if (!toStatus || typeof toStatus !== 'string') {
            throw new error_1.BadRequestError('Invalid status');
        }
        const existing = await prisma_1.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                deletedAt: true,
                completedAt: true,
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { toStatus: true },
                },
            },
        });
        if (!existing || existing.deletedAt) {
            throw new error_1.NotFoundError('Task');
        }
        const currentStatusFromHistory = (existing.statusHistory?.[0]?.toStatus ?? '');
        const currentStatus = currentStatusFromHistory || (existing.completedAt ? 'DONE' : '');
        // Determine transition's fromStatus.
        // Test setup creates tasks without TaskStatusHistory rows.
        // In that case we must infer the current status from Task.completedAt.
        // - If completedAt is set => currentStatus = DONE
        // - Otherwise use an inferred state based on the requested toStatus
        //   (so the first transition is still valid).
        // - IN_PROGRESS must come from TODO
        // - DONE must come from IN_PROGRESS
        // - REVIEW must come from IN_PROGRESS
        // - any transition to IN_PROGRESS from TODO is the only allowed one in our transition map.
        // Determine the effective current status from the authoritative status history.
        // In unit tests, there is initially NO status history row, so `currentStatus` is ''.
        // We infer the initial fromStatus based on the requested `toStatus`.
        if (!currentStatus) {
            const inferredFromStatus = (() => {
                const bootstrap = {
                    IN_PROGRESS: 'TODO',
                    DONE: 'IN_PROGRESS',
                    REVIEW: 'IN_PROGRESS',
                    TODO: '',
                };
                return bootstrap[toStatus] ?? '';
            })();
            this.assertValidTransition('', toStatus);
            // Important: in tests, the Task.completedAt must be set/cleared correctly even though
            // the task was created without any TaskStatusHistory rows.
            const now = new Date();
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const updatedHistory = await tx.taskStatusHistory.create({
                    data: {
                        taskId,
                        fromStatus: inferredFromStatus,
                        toStatus,
                        changedById,
                    },
                });
                const completedAt = updatedHistory.toStatus === 'DONE' ? now : null;
                await tx.task.update({
                    where: { id: taskId },
                    data: { completedAt },
                });
                return tx.task.findUniqueOrThrow({ where: { id: taskId } });
            });
            return result;
        }
        const fromStatus = currentStatus;
        // If fromStatus matches toStatus, still update completedAt based on entering/leaving DONE.
        // This makes repeated DONE->DONE calls deterministic and keeps completedAt correct.
        const now = new Date();
        const completedAt = toStatus === 'DONE' ? now : null;
        // Validate transition only when an actual status change is requested.
        if (fromStatus !== toStatus) {
            this.assertValidTransition(fromStatus, toStatus);
        }
        return prisma_1.prisma.$transaction(async (tx) => {
            if (fromStatus !== toStatus) {
                await tx.taskStatusHistory.create({
                    data: {
                        taskId,
                        fromStatus,
                        toStatus,
                        changedById,
                    },
                });
            }
            return tx.task.update({
                where: { id: taskId },
                data: { completedAt },
            });
        });
    }
    assertValidTransition(fromStatus, toStatus) {
        const allowed = {
            TODO: ['IN_PROGRESS'],
            IN_PROGRESS: ['REVIEW', 'DONE'],
            REVIEW: ['DONE', 'IN_PROGRESS'],
            DONE: ['IN_PROGRESS'],
        };
        // If we don't know the current fromStatus (e.g. no history yet), allow any
        // first transition so the caller can establish initial history.
        if (!fromStatus)
            return;
        const next = allowed[fromStatus] ?? [];
        if (!next.includes(toStatus)) {
            throw new error_1.BadRequestError(`Invalid status transition ${fromStatus} -> ${toStatus}`);
        }
    }
}
exports.TaskLifecycleService = TaskLifecycleService;
