import Head from 'next/head';
import { useRouter } from 'next/router';
import { getCourse } from '../../utils';
import { useEffect, useState } from 'react';


export default function Course() {
    const [course, setCourse] = useState({ url: '', name: '' });
    const [lessonStatus, setLessonStatus] = useState("");
    const [lessonLocation, setLessonLocation] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [totalTime, setTotalTime] = useState("");
    const router = useRouter();
    const { courseId } = router.query;

    useEffect(() => {
        if (typeof window !== "undefined") {

            // Cuando existe el window configuramos scorm-again
            window.API = new Scorm12API({ autocommit: true });

            // Cargar el progreso guardado desde el localStorage
            const usersCMI = localStorage.getItem("cmi");
            if (usersCMI) window.API.loadFromJSON(JSON.parse(usersCMI).cmi);

            // Escucha el evento 'LMSSetValue.cmi.*'
            window.API.on('LMSSetValue.cmi.*', function (CMIElement, value) {
                window.API.storeData(true);
                localStorage.setItem('cmi', JSON.stringify(window.API.renderCommitCMI(true)));
                console.log(window.API.renderCommitCMI(true));

                // Comprueba si hay algún error
                const errorCode = window.API.LMSGetLastError();
                if (errorCode !== "0") {
                    const errorString = window.API.LMSGetErrorString(errorCode);
                    const diagnostic = window.API.LMSGetDiagnostic(errorCode);
                    console.error("SCORM Error: " + errorString + " Diagnostic: " + diagnostic);
                } else {
                    console.log("No SCORM error occurred");
                }

            });

           /*  Valor inexistente para probar detección de errores
            window.API.LMSSetValue("cmi.core.non_existent_element", "some value"); */


            window.API.on('LMSSetValue.cmi.core.lesson_status', function (CMIElement, value) {
                setLessonStatus(value);
                console.log("Lesson status: " + value);
            });

            window.API.on('LMSSetValue.cmi.core.lesson_location', function (CMIElement, value) {
                setLessonLocation(value);
                console.log("Lesson location: " + value);
            });

            window.API.on('LMSSetValue.cmi.core.session_time', function (CMIElement, value) {
                setSessionTime(value);
                console.log("Session time: " + value);
            })

            window.API.on('LMSSetValue.cmi.core.total_time', function (CMIElement, value) {
                setTotalTime(value);
                console.log("Total time: " + value);
            });

        }
    }, [])



    useEffect(() => {
        // Cuando tenemos el courseId de la ruta cargamos el curso
        const course = getCourse(courseId)
        if (course) setCourse(course)
    }, [courseId])

    return (
        <div className='p-5 flex justify-between bg-blue-100 min-h-screen'>
            <Head>
                <title>{course && course.name}</title>
                <script type="text/javascript" src="/scorm-again.min.js"></script>
            </Head>

            <div className='p-5'>
                <a href='/' className='my-2 px-3 h-3 py-1 rounded bg-slate-50 hover:bg-slate-500 hover:text-slate-50'>Back</a>
                <h1 className='text-4xl font-bold my-6'>{course && course.name}</h1>
                <h2 className='text-xl font-semibold my-4'>Scorm MVP</h2>


                <div className='mt-4'>
                    <h3 className='text-lg font-semibold'>SCORM Data:</h3>
                    <p>Lesson Status: {lessonStatus}</p>
                    <p>Lesson Location: {lessonLocation}</p>
                    <p>Session Time: {sessionTime}</p>
                </div>
            </div>

            <div className='flex w-2/3 bg-slate-50 shadow rounded-lg overflow-hidden'>
                <iframe
                    className="w-full h-full"
                    id="course-iframe"
                    src={course && course.url}
                ></iframe>
            </div>

        </div>
    )
}
