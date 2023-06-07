import Head from 'next/head';
import { useRouter } from 'next/router';
import { getCourse } from '../../utils';
import { useEffect, useState } from 'react';


export default function Course() {
    const [course, setCourse] = useState({ url: '', name: '' });
    const router = useRouter();
    const { courseId } = router.query;

    useEffect(() => {
        // Cuando existe el window configuramos scorm-again
        window.API = new Scorm12API({ autocommit: true });

        // Iniciar una sesión SCORM
        window.API.LMSInitialize("");

        // Cargar el progreso guardado desde el localStorage
        const usersCMI = localStorage.getItem("cmi");
        if (usersCMI) window.API.loadFromJSON(JSON.parse(usersCMI).cmi);

        // Escucha el evento 'LMSSetValue.cmi.*'
        window.API.on('LMSSetValue.cmi.*', function (CMIElement, value) {
            window.API.storeData(true);
            localStorage.setItem('cmi', JSON.stringify(window.API.renderCommitCMI(true)));
            console.log(window.API.renderCommitCMI(true));
        });

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
