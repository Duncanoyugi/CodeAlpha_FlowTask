import { AppError } from '../../utils/error';
import { HttpStatus } from '../../constants/http';

export class SocketForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

