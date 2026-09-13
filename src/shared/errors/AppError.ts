/**
 * Classe de erro padrão para falhas de negócio da aplicação.
 *
 * Deve ser lançada pelos Services (regra de negócio) e capturada pelo
 * middleware/tratador de erro global da borda HTTP.
 *
 * @class
 */
export class AppError {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
