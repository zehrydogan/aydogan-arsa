import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Bir hata oluştu';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || message;
                error = responseObj.error || error;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }

        // Log the error
        this.logger.error(
            `${request.method} ${request.url}`,
            exception instanceof Error ? exception.stack : exception,
        );

        // Send user-friendly error response
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: this.getUserFriendlyMessage(status, message),
            error,
        });
    }

    private getUserFriendlyMessage(status: number, originalMessage: string): string {
        // Kullanıcı dostu hata mesajları
        const friendlyMessages: { [key: number]: string } = {
            400: 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.',
            401: 'Oturum açmanız gerekiyor.',
            403: 'Bu işlem için yetkiniz bulunmuyor.',
            404: 'Aradığınız kaynak bulunamadı.',
            409: 'Bu işlem çakışma yaratıyor. Lütfen tekrar deneyin.',
            422: 'Girdiğiniz bilgiler işlenemedi.',
            429: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
            500: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
            503: 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
        };

        return friendlyMessages[status] || originalMessage;
    }
}