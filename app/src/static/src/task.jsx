import {ConfiguratePanel} from './configurate'

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
                            {/* TODO */}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey = 'monitor'>
                        <Accordion.Header>Monitor</Accordion.Header>
                        <Accordion.Body>
                            {/* TODO */}
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