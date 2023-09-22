import {ConfiguratePanel} from './configurate'
import {Manager} from './manager'

const TaskContainer = (prop) => {

    // accordion state control
    const [accordionActiveKey, setAccordionActiveKey] = useState('configurate')
    const onSelectAccordion = (eventKey, event) => {
        setAccordionActiveKey(eventKey)
    }

    // form data state control
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

    return (
    <>
    <div className = 'd-flex justify-content-center'>
        <Card className = 'mt-3' style = {{width: '80%'}}>
            <Card.Header>
                <Card.Title>{prop.header}</Card.Title>
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