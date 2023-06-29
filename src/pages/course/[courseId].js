import { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { buildFromXML } from '../../utils/buildFromXML';

const FRONTEND_URL = 'http://localhost:3000';

export const getServerSideProps = async (context) => {
    const courseId = context.params.courseId;
    let objetoNuevo = {};

    try {
        const response = await axios.get(`${FRONTEND_URL}/courses_files/${courseId}/imsmanifest.xml`)
        const data = response.data;
        objetoNuevo = JSON.parse(buildFromXML(data));
    }
    catch (error) {
        console.error('Error:', error);
    }

    return { props: { courseId, courseData: objetoNuevo } }
}


export default function Course({ courseId, courseData }) {
    const [resource, setResource] = useState('#');
    const [lessonStatus, setLessonStatus] = useState("");
    const [lessonLocation, setLessonLocation] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [totalTime, setTotalTime] = useState("");
    const [objetives, setObjetives] = useState("");
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("");

    const buildCourseUrl = (url) => `/courses_files/${courseId}/${url}`;

    const getResourceByItem = (resourceId) => courseData.resources.resource.filter((r) => r.identifier === resourceId)[0];

    function renderItems(items) {
        return items.map((item) => (
            <>
                <button
                    className='my-2 px-3 py-1 rounded bg-slate-50 hover:bg-slate-500 hover:text-slate-50'
                    onClick={() => setResource(buildCourseUrl(getResourceByItem(item.identifierref).href))}>
                    {item.title}
                </button>
                {item.items.length > 0 && renderItems(item.items)}
            </>
        ));
    }


    function setInitialObjective(objectiveIndex, id, minScore, maxScore, rawScore, status) {
        // Para que funcione tiene que existir window.API
        if (!window || !window.API) console.log("setInitialObjetive debe estar en el useEffect")
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".id", id);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.min", minScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.max", maxScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".score.raw", rawScore);
        window.API.LMSSetValue("cmi.objectives." + objectiveIndex + ".status", status);
    }

    useEffect(() => {
        // Obtenemos el primer recurso
        const organizations = courseData.organizations;
        const organization = organizations.organization;
        const firstOrganization = organization[0];
        const courseTitle = firstOrganization.title;
        const firstOrganizationItems = firstOrganization.items;
        const firstItemFromFirstOrg = firstOrganizationItems[0];
        const resourceIdOfFirstItem = firstItemFromFirstOrg.identifierref;

        setTitle(courseTitle)
        setItems(firstOrganizationItems)

        const resources = courseData.resources;
        const resource = resources.resource;
        const openingResource = resource.filter((r) => r.identifier === resourceIdOfFirstItem)[0]  //pueden haber varios resource 
        const firsResourceUrl = openingResource.href;

        setResource(buildCourseUrl(firsResourceUrl))
    }, [])

    useEffect(() => {
        if (typeof window == "undefined") return;

        // Configuramos scorm-again
        window.API = new Scorm12API({
            autocommit: true,
            autocommitSeconds: 5,
            logLevel: 4,
            alwaysSendTotalTime: true
        });

        // Cargar el progreso guardado desde el localStorage
        const usersCMI = localStorage.getItem("cmi");
        if (usersCMI) window.API.loadFromJSON(JSON.parse(usersCMI).cmi);

        window.API.on('LMSInitialize', () => {
            console.log('Inicializado el LMS')
        });

        // Escucha todos los cambios del cmi
        window.API.on('LMSSetValue.cmi.*', function (CMIElement, value) {
            window.API.storeData(true);
            localStorage.setItem('cmi', JSON.stringify(window.API.renderCommitCMI(true)));
        });

        window.API.on('LMSSetValue.cmi.core.lesson_status', function (CMIElement, value) {
            setLessonStatus(value);
            //console.log("Lesson status: " + value);
        });

        window.API.on('LMSSetValue.cmi.core.lesson_location', function (CMIElement, value) {
            setLessonLocation(value);
            //console.log("Lesson location: " + value);
        });

        window.API.on('LMSSetValue.cmi.core.session_time', function (CMIElement, value) {
            setSessionTime(value);
            //console.log("Session time: " + value);
        })

        window.API.on('LMSSetValue.cmi.objectives.*', function (CMIElement, value) {
            const cmiPath = CMIElement.split('.');
            const key = cmiPath[cmiPath.length - 1]
            setObjetives(obj => ({ ...obj, [key]: value }));
        });

        window.API.on('LMSCommit', function () {
            let value = window.API.LMSGetValue("cmi.core.total_time");
            setTotalTime(value);
            //console.log("Total time: ", value);
        });

        // Seteamos el objetivo, pero no sabemos por que necesita estar en un setTimeout
        // Puede ser que tenga que ver con la carga del curso, quizas se pueden modificar las cosas
        // solo despues de que el curso esta cargadas las cosas
        setTimeout(() => {
            setInitialObjective(0, "Objetivo cargado desde Scorm Again", 0, 100, 0, "Completed");
        }, 1000)

    }, [])


    return (
        <div className='p-5 flex justify-between bg-blue-100 min-h-screen'>
            <Head>
                <title>{title}</title>
                <script type="text/javascript" src="/scorm-again.min.js"></script>
            </Head>

            <div className='p-5'>
                <a href='/' className='my-2 px-3 h-3 py-1 rounded bg-slate-50 hover:bg-slate-500 hover:text-slate-50'>Back</a>
                <h1 className='text-4xl font-bold my-6'>{title}</h1>

                <div className='flex flex-col'>{!!items.length && !!items[0].items.length && renderItems(items)}</div>

                <div className='mt-4 bg-blue-50'>
                    <h3 className='text-lg font-semibold'>SCORM Data:</h3>
                    <p>Lesson Status: {lessonStatus}</p>
                    <p>Lesson Location: {lessonLocation}</p>
                    <p>Session Time: {sessionTime}</p>
                    <p>Total Time: {totalTime}</p>
                    <pre>Objectives: {JSON.stringify(objetives, null, 2)}</pre>
                </div>


            </div>

            <div className='flex w-2/3 bg-slate-50 shadow rounded-lg overflow-hidden'>
                <iframe
                    sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin"
                    className="w-full h-full"
                    id="course-iframe"
                    src={resource}
                ></iframe>
            </div>

        </div>
    )
}
