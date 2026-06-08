import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto, AuthResponseDto } from './auth.dto';
import { hashPassword, comparePassword } from '../../../src/utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../src/utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../../src/utils/error';
import { env } from '../../../src/config/env';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await this.authRepository.createUser({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
    });

    // Generate tokens
    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.authRepository.saveRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.saveRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token exists and not revoked
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Get user
    const user = await this.authRepository.findUserById(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Revoke old refresh token
    await this.authRepository.revokeRefreshToken(refreshToken);

    // Generate new tokens
    const newPayload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    // Save new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.saveRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserRefreshTokens(userId);
  }
}