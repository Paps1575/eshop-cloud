import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const baseOptions = {
  confirmButtonColor: '#0b5ed7',
  background: '#ffffff',
  color: '#172033',
}

export function showAlert(message, type = 'info', title) {
  const titles = {
    success: 'Listo',
    error: 'Algo salió mal',
    warning: 'Revisa esta información',
    info: 'Información',
  }

  return Swal.fire({
    ...baseOptions,
    icon: type,
    title: title ?? titles[type] ?? titles.info,
    text: message,
  })
}

export function showToast(message, type = 'success') {
  return Swal.fire({
    ...baseOptions,
    icon: type,
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  })
}
