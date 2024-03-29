import React, { useEffect, useState } from 'react'
import { Card, Button } from 'flowbite-react'; // Importamos los componentes de Flowbite
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importamos FontAwesome para los iconos
import { faPencil, faArrowRight, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import AxiosCliente from '../../../config/htpp-gateway/http-client';
import ModalCreateClass from '../../../components/docente/ModalCreateClass';
import { customAlert, confirmAlert } from '../../../config/alert/alert'
import ModalUpdateClass from '../../../components/docente/ModalUpdateClass';

const ClasesList = () => {
    const [filterText, setFilterText] = useState("");
    const [idDoc, setIdDoc] = useState(localStorage.getItem('idDocente'));
    const [clases, setClases] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [classData, setClassData] = useState(null);
    console.log(idDoc);

    const getClases = async () => {
        try {
            const response = await AxiosCliente({
                method: 'GET',
                url: '/clase/',
            })
            if (!response.error) {
                console.log(response.data);
                setClases(response.data);
            } else throw Error('Error');
        } catch (error) {
            console.log(error);
        }
    }

    const deleteClases = (id) => {
        confirmAlert(async () => {
            console.log("Se va a borrar al",id);
            try {
                const response = await AxiosCliente({
                    method: 'DELETE',
                    url: '/clase/' + id
                });
                console.log("Respuesta del servidor:", response);
                if (!response.error) {
                    customAlert("Éxito", "Clase eliminada", "success")
                    getClases();
                }
                return response;
            } catch (error) {
                customAlert("Error", "Ocurrió un error al eliminar la clase", "error")
            } finally {
            }
        })
    }

    useEffect(() => {
        getClases();
    }, []);

    
    const goUpdate = (data) => {
        console.log(data);
        setOpenUpdate(true);
        setClassData(data);
    }

    return (
        <div>
            <div className='flex justify-end'>
                <Button pill outline color='success' onClick={() => setOpenCreate(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
                <ModalCreateClass openModal={openCreate} setOpenModal={setOpenCreate} getClasses={getClases} />
            </div>
            <div className='flex flex-wrap mt-4 mx-5 mr-3 p-4 border-b border-gray-700 bg-gray-50 dark:border-gray-600 dark:bg-gray-700 h-full justify-evenly' style={{ backgroundColor: '#D9D9D9' }}>

                {clases
                    .filter((clase) => {
                        return clase.name.toLowerCase().includes(filterText.toLowerCase());
                    })
                    .map((clase, index) => {
                        const usuarioId = clase.usuario.id.toString().toLowerCase();
                        const docenteId = idDoc.toString().toLowerCase();
                        if (usuarioId === docenteId) {
                            return (
                                <Card key={index} className="mx-auto mb-5 p-4 flex-grow border w-64" style={{ backgroundColor: '#13505B' }}>
                                    <div className='d-flex align-items-center justify-content-center h-20' style={{ background: '#13505B', color: 'white' }}>
                                        <h1 style={{ fontSize: '24px' }} >{clase.name}</h1>
                                    </div>
                                    <div className='flex justify-between w-full'>
                                        <Button pill outline color='light' className="mx-2" onClick={() => goUpdate(clase)}>
                                            <FontAwesomeIcon icon={faPencil} style={{ color: '#13505B' }} />
                                        </Button>
                                        <Button pill outline color='light' className="mx-2" onClick={() => deleteClases(clase.id)}>
                                            <FontAwesomeIcon icon={faTrash} style={{ color: '#13505B' }} />
                                        </Button>
                                    </div>
                                    {openUpdate && <ModalUpdateClass data={classData} openModalUp={openUpdate} setOpenModalUp={setOpenUpdate} />}
                                </Card>
                                
                            );
                        } else {
                            console.log("No eres el docente de esta clase");
                        }
                    })
                }

            </div>
        </div>

    )
}

export default ClasesList