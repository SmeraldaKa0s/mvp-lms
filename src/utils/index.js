// TODO no hardcodear los cursos. 
// Puede ser que obtengamos esta info pegandole a ismanifest.xml y meta.xml
export const courses = [
    {
        id: 'curso1',
        name: 'Modelo de Servicio Easy - Modulo 06',
        url: '/courses_files/curso1/index_lms.html',
        type: 'scorm12',
        thumbnail: '/courses_files/curso1/story_content/thumbnail.jpg',
        description: '',
    },
    {
        id: 'runtime',
        name: 'Curso de Runtime',
        url: '/courses_files/runtime/shared/launchpage.html',
        type: 'scorm12',
        thumbnail: '/courses_files/runtime/Etiquette/course.jpg',
        description: '',
    },
    {
        id: 'ReacCourse',
        name: 'React Intro',
        url: '/courses_files/ReacCourse/index.html',
        type: 'scorm12',
        thumbnail: '/courses_files/runtime/Etiquette/course.jpg',
        type: 'scorm12',
    
    },
    {
        id: 'ReacCourse2',
        name: 'React Intro 2',
        url: '/courses_files/ReacCourse/react.html',
        type: 'scorm12',
        thumbnail: '/courses_files/runtime/Etiquette/course.jpg',
        type: 'scorm12',
    
    },
];

export const getCourse = (courseId) => courses.find(course => course.id === courseId)
