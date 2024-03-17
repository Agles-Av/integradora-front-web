import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alertclient = withReactContent(Swal);

//Titulos y mensajaes definidos Succes | error | confirm
//alert error
//alert confirm
//alert succes

//succes info warning
export const customAlert = (title, text, icon) => {
return Alertclient.fire({
    title,
    text,
    icon,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Aceptar"
});
};

export const confirmAlert = (preConfirm) => {
    return Alertclient.fire({
      title:"¿Estás seguro de realizar esta acción?",
      text:"Le solicitamos esperar un momento a que la solicutud termine",
      icon:'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#0E7490',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      showLoaderOnConfirm: true,
      allowOutsideClick:()=> AlertClient.isLoading(),
      reverseButtons: true,
      backdrop: true,
      preConfirm,
    });
  }