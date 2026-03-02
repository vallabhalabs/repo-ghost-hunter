import { HttpException, HttpStatus } from '@nestjs/common';

export class GithubUnauthorizedException extends HttpException {
  constructor(message = 'GitHub access token is expired or invalid') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class GithubRateLimitException extends HttpException {
  constructor(message = 'GitHub API rate limit exceeded') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class GithubForbiddenException extends HttpException {
  constructor(message = 'GitHub access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class GithubNotFoundException extends HttpException {
  constructor(message = 'GitHub resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class GithubApiException extends HttpException {
  constructor(message = 'GitHub API error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
