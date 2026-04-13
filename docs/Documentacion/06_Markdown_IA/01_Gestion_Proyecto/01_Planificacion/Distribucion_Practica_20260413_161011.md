# Distribucion_Practica_20260413_161011

Fuente: 01_Gestion_Proyecto/01_Planificacion/Distribucion_Practica_20260413_161011.pdf

---

                                     Proyecto Dune


Distribución de la Practica
Equipo Técnico:
       Este bloque es el responsable directo de todo aquello sin lo cual la práctica no
compila, no ejecuta y no aprueba. Su campo de acción comprende la arquitectura del
sistema, la implementación en C#, la lógica distribuida, la persistencia, la simulación, la
robustez y la integración final. Dado que el PDF exige explícitamente un cliente de
administración, un servicio de simulación, un servicio de persistencia, un modelo
compartido y un registro de eventos, este bloque debe monopolizar esas piezas.
También le corresponde la definición del mecanismo de comunicación entre
componentes, la serialización, la gestión de errores y la coherencia del repositorio
GitHub.
        Dentro de este bloque, Max debe quedar como responsable principal de
arquitectura y dirección técnica. Le corresponde diseñar la solución en proyectos,
definir contratos, DTOs, entidades y enumerados, decidir el protocolo de comunicación
entre componentes, implementar la lógica de simulación de rondas y garantizar la
consistencia general del sistema. También debe supervisar las decisiones de
concurrencia, sincronización y tratamiento de fallos, porque son aspectos troncales de la
práctica y aparecen expresamente valorados en la entrega tercera y en la memoria final.
En términos empresariales, Max sería el Lead Developer / Software Architect.
       Marcos, por su parte, debe asumir una función de desarrollo e integración
subordinada, pero sustantiva. Le corresponde implementar el cliente de administración o
centro de mando, construir la persistencia en JSON, enlazar la interfaz con los servicios,
reforzar las validaciones de negocio, desarrollar pruebas funcionales y colaborar en la
bitácora de eventos y en la gestión del repositorio. También debe encargarse del
saneamiento del código, del control de errores de usuario y de la preparación de la demo
ejecutable. Su papel idóneo sería el de Developer / Integrations & Client Engineer. El
PDF exige que el centro de mando muestre instalaciones, criaturas, fondos, visitantes y
eventos, y que la aplicación permita configurar partida, ejecutar rondas y guardar estado;
eso, en la práctica, debe recaer principalmente en Marcos, bajo supervisión técnica de
Max.
        En síntesis, el bloque técnico debe entregar cuatro grandes resultados: primero,
el sistema distribuido funcional; segundo, la estructura de código y repositorio; tercero,
la simulación del dominio del juego; y cuarto, la parte técnica de la memoria y de la
defensa. Sin ese bloque, no hay proyecto.


Equipo Humanidades y Ciencias Sociales:
       Este bloque no debe invadir el terreno de la implementación dura, porque el PDF
no es un ejercicio de narrativa ni de diseño cultural autónomo, sino una práctica técnica.
Ahora bien, su aportación puede ser decisiva si se la orienta con rigor hacia todo lo que
dota al proyecto de coherencia estética, documental, narrativa y expositiva. El
enunciado no pide únicamente que el sistema funcione: también pide una ambientación
inteligible en el universo de Dune, una memoria técnica bien estructurada y una defensa
solvente. Ahí este bloque puede elevar mucho la calidad global del trabajo. El propio
documento subraya la importancia del marco conceptual, de la justificación de
decisiones y de una presentación clara del sistema.
        A Carla le corresponde la coordinación documental y narrativa aplicada. Debe
encargarse de la organización del dossier conceptual del proyecto, de la redacción del
marco general del juego, de la coherencia de escenarios, de la justificación del tono
visual y del diseño de la presentación final. En términos concretos, debe trabajar sobre
la definición clara de la identidad de cada escenario —Arrakeen, Giedi Prime y
Caladan—, convertir esa información en material comprensible para la interfaz y la
defensa, y preparar esquemas de explicación que faciliten al bloque técnico comunicar
lo que ha construido. También puede asumir el storyboard de la experiencia de usuario:
qué ve el jugador, en qué orden, qué acciones realiza y qué sentido tiene cada pantalla o
secuencia operativa. Las referencias visuales de Arrakis y Caladan que aparecen en las
páginas 5 y 6 del PDF deben ser procesadas por este bloque como guía de coherencia
estética, no como adorno superficial.
        A Mateo le corresponde la dirección de worldbuilding, taxonomía y redacción
estratégica. Debe sistematizar la lógica interna del universo jugable: nomenclatura de
enclaves, instalaciones, criaturas, clases de recinto, descripciones de biomas, coherencia
terminológica y articulación del relato de la Casa Menor dentro del marco imperial.
Igualmente, debe redactar o co-redactar la parte no puramente informática de la
memoria: análisis general de la aplicación, objetivos funcionales, contextualización
temática, justificación del diseño diegético y preparación argumentativa de la defensa
oral. También puede preparar el glosario del proyecto, la explicación de por qué cada
instalación y criatura está donde está, y la relación entre la ambientación y la mecánica
de gestión. En suma, su función es evitar que el proyecto parezca un código correcto
pero conceptualmente deslavazado.
       Este bloque, además, debe responsabilizarse de tres tareas transversales que
suelen descuidarse y después penalizan. La primera es la consistencia terminológica: no
puede haber nombres cambiantes, categorías mal cerradas o descripciones
contradictorias entre PDF, interfaz, presentación y memoria. La segunda es la
preparación de la defensa: preguntas posibles, discurso de apertura, secuencia de
exposición, reparto de turnos y guion argumental. La tercera es el control de legibilidad
externa: revisar que un profesor pueda entender qué hace el sistema sin tener que
deducirlo del código.


Limites:
       La frontera debe ser tajante. El bloque técnico construye el sistema; el bloque de
humanidades construye la inteligibilidad del sistema. El primero programa, integra,
corrige y valida; el segundo explica, ordena, contextualiza y presenta. El primero
responde por arquitectura, persistencia, simulación, concurrencia y errores; el segundo
responde por worldbuilding, interfaz discursiva, documentación, coherencia narrativa y
defensa oral. Esta división es la más racional porque reproduce exactamente la
estructura de exigencias del PDF: una columna vertebral técnica, complementada por
una envolvente conceptual y expositiva.


Distribución final:
       Bloque técnico: desarrollar el producto. Max lidera arquitectura, simulación y
decisiones distribuidas; Marcos implementa cliente, persistencia, integración,
validaciones y soporte de pruebas.
        Bloque de humanidades: construir el marco del producto. Carla lidera
documentación visual, storyboard, presentación y coherencia expositiva; Mateo lidera
worldbuilding, taxonomía del universo, redacción estratégica y preparación argumental
de la defensa.
       Y conviene decirlo sin rodeos: en este proyecto, el peso principal recae
necesariamente sobre Max y Marcos, porque así lo impone la naturaleza de la práctica y
así lo confirma el calendario de entregas, centrado en dominio, arquitectura,
comunicación, persistencia, simulación, concurrencia y sistema completo con memoria
técnica. El bloque de humanidades no sustituye ese trabajo; lo convierte en un proyecto
más sólido, más presentable y mejor defendible.
