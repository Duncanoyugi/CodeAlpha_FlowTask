"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCompletionRate = calculateCompletionRate;
exports.formatRelativeTime = formatRelativeTime;
exports.dashboardActivityToRecent = dashboardActivityToRecent;
function calculateCompletionRate(total, completed) {
    if (total <= 0)
        return 0;
    return Math.round((completed / total) * 100);
}
function formatRelativeTime(value, now = new Date()) {
    if (!value)
        return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime()))
        return '—';
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 60)
        return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
        return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
}
function dashboardActivityToRecent(a) {
    return {
        id: a.id,
        createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
        actor: {
            id: a.user?.id,
            firstName: a.user?.firstName,
            lastName: a.user?.lastName,
            avatar: a.user?.avatar,
        },
        verb: a.action,
        target: {
            type: a.entityType,
            id: a.entityId,
            label: a.projectId ? `project:${a.projectId}` : undefined,
        },
        relativeTime: formatRelativeTime(a.createdAt),
    };
}
