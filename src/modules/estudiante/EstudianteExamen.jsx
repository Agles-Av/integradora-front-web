import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Label, Radio, TextInput } from 'flowbite-react';
import { useLocation } from 'react-router-dom';
import AxiosCliente from '../../config/htpp-gateway/http-client';
import { confirmAlertExamen, customAlert } from '../../config/alert/alert';
import { getColorsFromServer } from '../../config/colors/colorService';

function EstudianteExamen() {
  
  const [colors, setColors] = useState([]);
  const [preguntasMostradas, setPreguntasMostradas] = useState([]);
  
  useEffect(() => {
    const fetchColors = async () => {
      const colorsData = await getColorsFromServer();
      if (colorsData) {
        setColors(colorsData);
      }
    };

    fetchColors();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const idEstudiante = localStorage.getItem('idEstudiante');
  console.log(idEstudiante);

  const { dataDoExamen } = location.state;
  const { preguntas, numeroPreguntas } = dataDoExamen;
  const { code } = dataDoExamen;

  const [respuestas, setRespuestas] = useState([]);
  const [alreadyExist, setAlreadyExist] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const shuffleQuestions = (preguntas) => {
      return preguntas.sort(() => Math.random() - 0.5);
    };

    const preguntasAleatorias = shuffleQuestions(preguntas);
    const preguntasMostradas = preguntasAleatorias.slice(0, numeroPreguntas);
    setPreguntasMostradas(preguntasMostradas);
  }, []); // Ejecutar solo una vez al cargar el componente


  const handleChange = (preguntaId, respuestaId, esTexto = false, textoRespuesta = '') => {
    setRespuestas((prev) => {
      const preguntaObj = preguntasMostradas.find(p => p.id === preguntaId);
      let respuestaObj = null;
      if (!esTexto) {
        respuestaObj = preguntaObj.respuestas.find(r => r.id === respuestaId);
      }
      const respuestaNueva = {
        correcta: false,
        description: esTexto ? textoRespuesta : '',
        respuesta: respuestaObj,
        usuario: { id: Number(idEstudiante) },
        pregunta: preguntaObj,
      };

      // Reemplaza la redspuesta andterior para esta pregudnta si existe  so dagrega una nueva 😱
      const indiceExistente = prev.findIndex(r => r.pregunta.id === preguntaId);
      if (indiceExistente !== -1) {
        const respuestasActualizadas = [...prev];
        respuestasActualizadas[indiceExistente] = respuestaNueva;
        return respuestasActualizadas;
      } else {
        return [...prev, respuestaNueva];
      }
    });
  };

  const handleSubmit = async () => {
    if (respuestas.length < preguntasMostradas.length) {
      customAlert("Error", "Debes responder todas las preguntas", "error");
      return;
    }
    confirmAlertExamen(async () => {
      console.log("respuestas enviadas",respuestas);
      try {
        const response = await AxiosCliente({
          url: "/usuariorespuesta/",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: respuestas
        })
        console.log("response",response);
        cambiar();
      } catch (error) {
        console.log(error);
        customAlert("Error", "Ocurrió un error al enviar tus respuestas", "error");
      }
    })
  }

  const cambiar = async () => {
    await customAlert("Examen enviado", "Tus respuestas han sido enviadas correctamente", "success");
    navigate("/homeEstudiante", { replace: true });
  }

  const examenHecho =  () => {
    alreadyExist.map((exame)=>{
      if(exame === code){
        customAlert("Examen ya realizado", "Ya has realizado este examen", "error");
        navigate("/homeEstudiante", { replace: true });
        setMostrar(true);
      }
    })
  }
  examenHecho();


  const  getExamHistory = async () => {
    try {
      const response = await AxiosCliente({
        url:"/usuariorespuesta/examencode/"+idEstudiante,
        method:"GET"
      })
      if(!response.error)
      console.log("Codigoexistente",response.data);
    setAlreadyExist(response.data);
    } catch (error) {
     console.log(error); 
    }
  }

  useEffect(()=>{
    getExamHistory();
  },[]);

  return (
    mostrar ? (
      <div>
        <h1>Ya has realizado este examen</h1>
      </div>
    ):(
      <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
        console.log(respuestas);
      }}
    >
      <div className='flex flex-col items-center'>
        <div className='flex flex-col border rounded-md my-4 max-w-md bg-gray-100 shadow w-full p-4' style={{ backgroundColor: '#DfDfDf', borderColor: colors[0] && colors[0].color3 }}>
          <h1 className='text-lg font-bold' style={{color:colors[0] && colors[0].color2}}>{dataDoExamen.title}</h1>
          <h2 className='text-md mt-2' style={{ color: colors[0] && colors[0].color2 }}>{dataDoExamen.description}</h2>
        </div>
        {preguntasMostradas.map((preguntaP, index) => (
          <div key={index} className='flex flex-col rounded-md border my-4 max-w-md bg-gray-100 shadow-md w-full p-4' style={{ backgroundColor: '#DfDfDf', borderColor: colors[0] && colors[0].color3 }}>
            <h1 className='text-lg font-bold text-green-700 mb-4'>{preguntaP.name}</h1>
            <div>
              {preguntaP.tipo ? (
                preguntaP.respuestas.map((respuestaP, idx) => (
                  <div key={idx} className='flex items-center space-x-2 mb-2'>
                    <Radio id={`respuesta-${idx}-${index}`} name={`pregunta-${index}`} value={respuestaP.id}
                      onChange={() => handleChange(preguntaP.id, respuestaP.id)}
                    />
                    <Label htmlFor={`respuesta-${idx}-${index}`}>{respuestaP.nombre}</Label>
                  </div>
                ))
              ) : (
                <TextInput
                  id={`pregunta-texto-${preguntaP.id}`}
                  placeholder="Escribe tu respuesta aquí"
                  onChange={(e) => handleChange(preguntaP.id, null, true, e.target.value)}

                  className="mt-2"
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-center'>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Enviar respuestas
        </button>
      </div>
    </form>
    )
  );
}

export default EstudianteExamen