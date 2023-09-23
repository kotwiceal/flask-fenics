import Card from 'react-bootstrap/Card'
import Accordion from 'react-bootstrap/Accordion'
import {ConfiguratePanel} from './configurate'
import {Manager} from './manager'
import {MonitorPanel, progressHandle} from './monitor'
import {useState, useReducer, useEffect, useRef} from 'react'

const TaskContainer = ({socket, header}) => {

    // accordion state control
    const [accordionActiveKey, setAccordionActiveKey] = useState('configurate')
    const onSelectAccordion = (eventKey, event) => {
        setAccordionActiveKey(eventKey)
    }

    // form data state control
    const isMountedConfigurate = useRef(false);
    const [formDisabledConfigurate, setFormDisabledConfigurate] = useState(false)
    const [formDataConfigurate, setFormDataConfigurate] = useState({})
    const form_configurate = {
        setFormData: setFormDataConfigurate, 
        formDisabled: formDisabledConfigurate, 
        setFormDisabled: setFormDisabledConfigurate
    }

    // manager state contol
    const [manager, setManager] = useState({free: [true, false, true, true]})

    // monitor state control
    const isMountedMonitor = useRef(false);
    const [monitor, setMonitor] = useState(true)
    const figureInitial = {plotter: 'matplotlib', extension: 'png', type: 'base64', image: '', state: false}
    const [figure, setFigure] = useState(figureInitial)
    const [formDisabledMonitor, setFormDisabledMonitor] = useState(false)
    const [formDataMonitor, setFormDataMonitor] = useState({type: 'matplotlib', font_size: 16,
        clim: [0, 1], cmap: 'viridis', bg_color: '#0f346b', font_color: '#3d66a4', fig_size: [400, 400]})
    const form_monitor = {
        formData: formDataMonitor,
        setFormData: setFormDataMonitor, 
        formDisabled: formDisabledMonitor, 
        setFormDisabled: setFormDisabledMonitor
    }

    // progress state control
    const [progress, setProgress] = useReducer(progressHandle, {state: false, bars: {
        'initialize': {key: 'initialize', variant: 'primary', striped: true,
            animated: true, now: 0, label: ''},
        'process': {key: 'process', variant: 'primary', striped: true,
            animated: true, now: 0, label: ''}
    }})

    // start socket
    socket.connect()

    // define socket events
    useEffect(() => {

        socket.on('connect', () => {
            setIsConnected(true)
            console.log('socketio: connection event', socket.id)
        })

        socket.on('manager', (data) => {
            setManager(data)
            console.log('socketio: manager event', data)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
            console.log('socketio: disconnect event')
        })

        socket.on('process', (data) => {
            console.log('process', data)
            setProgress({type: 'processed'})
            setFormDisabledConfigurate(false)
        })

        socket.on('monitor', (data) => {
            console.log('monitor event', data)
            data.state = true
            setFigure(data)
            setProgress({type: 'processing', value: data.progress})
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    // start processing
    useEffect(() => {
        if (isMountedConfigurate.current) {
            console.log(formDataConfigurate)
            socket.emit('process', {id: 'test', problem: formDataConfigurate, styles: {bg_color: '#563d7c'}})

            setMonitor(true)
            setTimeout(() => {setAccordionActiveKey('monitor')}, 500)
            let figureInitialTemp = figureInitial
            figureInitialTemp.state = true
            setFigure(figureInitialTemp)
            setFormDisabledConfigurate(true)
            setProgress({type: 'initialize'})
        } else {
            isMountedConfigurate.current = true
        }
    }, [formDataConfigurate])

    // to change monitor appearance
    useEffect(() => {
        if (isMountedMonitor.current) {
            console.log(formDataMonitor)
            socket.emit('monitor_update', {id: 'test', styles: {formDataMonitor}})
        } else {
            isMountedMonitor.current = true
        }
    }, [formDataMonitor])

    return (
    <>
    <div className = 'd-flex justify-content-center'>
        <Card className = 'mt-3' style = {{width: '80%'}}>
            <Card.Header>
                <Card.Title>{header}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Accordion activeKey = {accordionActiveKey} alwaysOpen onSelect = {onSelectAccordion}>
                    <Accordion.Item eventKey = 'configurate'>
                        <Accordion.Header>Configurate</Accordion.Header>
                        <Accordion.Body>
                            <ConfiguratePanel formControl = {form_configurate}/>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey = 'manager'>
                        <Accordion.Header>Manager</Accordion.Header>
                        <Accordion.Body>
                            <Manager manager = {manager}/>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey = 'monitor'>
                        <Accordion.Header>Monitor</Accordion.Header>
                        <Accordion.Body>
                            <MonitorPanel figure = {figure} progress = {progress}
                                formControl = {form_monitor}
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Card.Body>
            <Card.Footer className = 'text-muted'>fenicsproject</Card.Footer>
        </Card>
    </div>
    </>
    )
}

export {TaskContainer}