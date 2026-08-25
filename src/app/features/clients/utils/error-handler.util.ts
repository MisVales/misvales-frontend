import { HttpErrorResponse } from '@angular/common/http';

export function handleClientError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      // In a real app this would trigger logout/redirect
      return 'Sesión expirada. Por favor vuelva a iniciar sesión.';
    }
    if (error.status === 403) {
      return 'No tiene permisos para realizar esta acción.';
    }
    if (error.status === 404) {
      return 'El cliente o recurso no fue encontrado.';
    }
    if (error.status === 419) {
      return 'Sesión caducada (CSRF). Intente nuevamente.';
    }
    if (error.status === 429) {
      return 'Demasiadas solicitudes. Espere un momento e intente de nuevo.';
    }
    
    const errorCode = error.error?.code || '';
    
    switch (errorCode) {
      case 'CLIENT_CURP_EXISTS':
        return 'La CURP ya se encuentra registrada.';
      case 'CLIENT_ADDRESS_EXISTS':
        return 'El domicilio ya se encuentra registrado.';
      case 'CLIENT_NOT_FOUND':
        return 'Cliente no encontrado.';
      case 'CLIENT_SCOPE_DENIED':
        return 'Alcance denegado para operar sobre este cliente.';
      case 'CLIENT_ASSIGNMENT_NOT_ACTIVE':
        return 'La asignación del cliente no está activa.';
      case 'CLIENT_BANK_ACCOUNT_INVALID':
        return 'La cuenta bancaria es inválida.';
      case 'CLIENT_BANK_ACCOUNT_CONFLICT':
        return 'Conflicto al registrar la cuenta bancaria.';
      case 'CLIENT_PORTFOLIO_ENTRY_INVALID':
        return 'El movimiento de cartera es inválido.';
      case 'CLIENT_PORTFOLIO_BALANCE_NEGATIVE':
        return 'El saldo no puede ser negativo.';
      case 'CLIENT_PORTFOLIO_ENTRY_IMMUTABLE':
        return 'El movimiento no puede ser modificado.';
      case 'RESOURCE_VERSION_CONFLICT':
        return 'Conflicto de versión. Los datos han sido modificados por otro usuario.';
      case 'AUTH_SCOPE_DENIED':
        return 'Permiso denegado por alcance de autenticación.';
    }

    if (error.status === 422) {
      return 'Por favor, revise los campos del formulario.';
    }
    
    if (error.status === 409) {
      return 'Conflicto al procesar la solicitud (Duplicidad o Versión).';
    }

    return `Error del servidor: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error desconocido.';
}
