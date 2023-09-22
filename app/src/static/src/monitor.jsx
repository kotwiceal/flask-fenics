import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import Modal from 'react-bootstrap/Modal'
import Stack from 'react-bootstrap/Stack'
import Card from 'react-bootstrap/Card'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

import {useState, useId} from 'react'
import {SelectPattern, ColorPattern, FormPattern,
    PlaceholderPattern, NumberInputPattern, ArrayInputPattern} from './toolkit'

const progressHandle = (state, action) => {
    let progressTemp = state
    switch (action.type) {
        case 'initialize': {
            progressTemp['state'] = true
            progressTemp['bars']['initialize'] = Object.assign(progressTemp['bars']['initialize'], 
                {variant: 'primary', striped: true,
                animated: true, now: 20, label: 'Initializing'}
            )
            progressTemp['bars']['process'] = Object.assign(progressTemp['bars']['process'], 
                {variant: 'primary', striped: true,
                animated: true, now: 0, label: '0%'}
            )
            return progressTemp
        }
        case 'processing': {
            progressTemp['bars']['initialize'] = Object.assign(progressTemp['bars']['initialize'], 
                {variant: 'success', striped: false,
                animated: false, now: 20, label: 'Initialized'}
            )
            if (action.value == 100) {
                progressTemp['bars']['process'] = Object.assign(progressTemp['bars']['process'], 
                    {variant: 'primary', striped: false,
                    animated: false, now: action.value, label: 'processed'}
                )
            } else {
                progressTemp['bars']['process'] = Object.assign(progressTemp['bars']['process'], 
                    {variant: 'primary', striped: true,
                    animated: true, now: action.value, label: `${action.value}%`}
                )
            }
            return progressTemp
        }
        case 'processed': {
            progressTemp['bars']['process'] = Object.assign(progressTemp['bars']['process'], 
                {variant: 'primary', striped: false,
                animated: false, now: 100, label: 'processed'}
            )
            return progressTemp
        }
    }
}

const ModalApperience = (prop) => {

    return (
    <>
    <Modal centered show = {prop.show} onHide = {prop.handleClose}>
        <Modal.Dialog className = 'm-0'>
            <Modal.Header closeButton>
                <Modal.Title>Figure apperience</Modal.Title>
            </Modal.Header>
            <FormPattern formControl = {prop.formControl} 
                children = {
                    <>
                    <Modal.Body>
                        <ApperiencePanel handleClose = {prop.handleClose} 
                            formControl = {prop.formControl}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant = 'primary' type = 'submit' onClick = {prop.handleClose}>Apply</Button>
                    </Modal.Footer>
                    </>
                }
            />
      </Modal.Dialog>
    </Modal>
    </>
    )
}

const ApperiencePanel = ({formControl}) => {

    return (
    <>
    <Stack gap = {2}>
        <Row>
            <SelectPattern label = 'Plotter' name = 'type' 
                required = {true}
                defaultValue = {formControl.formData.type}
                options = {[{value: 'matplotlib', text: 'matplotlib'}]}
                feedback = 'Please choose a plotter type.'
            />  
        </Row>
        <Row>
            <NumberInputPattern label = 'Font size' name = 'font_size'
                required = {true} value = {formControl.formData.font_size} range = {[8, 32]}
            />
        </Row>
        <Row>
            <ArrayInputPattern label = 'Color limit' name = 'clim'
                required = {true} value = {formControl.formData.clim} dim = {2} range = {[-1e3, 1e3]}
            />
        </Row>
        <Row>
            <SelectPattern label = 'Colormap' name = 'cmap' 
                required = {true}
                defaultValue = {formControl.formData.cmap}
                options = {
                    [
                        {value: 'viridis', text: 'viridis'}, 
                        {value: 'plasma', text: 'plasma'},
                        {value: 'cividis', text: 'cividis'},
                        {value: 'jet', text: 'jet'}
                    ]
                }
            />  
        </Row>
        <Row>
            <ColorPattern label = 'Background color' name = 'bg_color' value = {formControl.formData.bg_color}/>
        </Row>
        <Row>
            <ColorPattern label = 'Font color' name = 'font_color' value = {formControl.formData.font_color}/>
        </Row>
    </Stack>
    </>
    )
}

const FigureMonitor = ({figure, formControl}) => {

    const [show, setShow] = useState(false)

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    const emptyImage = figure.image != '' ? true : false

    const href = `data:image/${figure.extension};${figure.encode},${figure.image}`
    const saveFileName = `image-${figure.progress}.${figure.extension}`

    return (
    <>
    {
        figure.state &&
        <Card border = 'dark'>
            <Card.Body>
                <PlaceholderPattern state = {emptyImage} type = 'button' xs = {12}
                    children = {
                        <ButtonGroup className = 'float-end'>
                            <Button variant = 'primary' href = {href} download = {saveFileName}>
                                <i className = 'bi bi-save-fill'/>
                            </Button>
                            <Button variant = 'primary' onClick = {handleShow}>
                                <i className = 'bi bi-gear-fill'/>
                            </Button>
                        </ButtonGroup >
                    }
                />
                <ModalApperience {...{show, handleShow, handleClose, formControl}}/>
            </Card.Body>
            {
                figure.plotter == 'matplotlib' && 
                <PlaceholderPattern state = {emptyImage} type = 'image'
                    children = {<Card.Img variant = 'bottom' src = {href}/>}
                />
            }
        </Card>
    }
    </>
    )
}

const StateBar = ({progress}) => {

    return (
    <>
    <PlaceholderPattern state = {progress.state} xs = {12}
        children = {
            <Alert variant = {'light'}>
                <ProgressBar>
                    {
                        Object.entries(progress.bars).map(([key, value]) => {
                            return <ProgressBar {...value}/>
                        })
                    }
                </ProgressBar>
            </Alert>
        }
    />
    </>
    )
}

const MonitorPanel = ({formControl, progress, figure}) => {

    return (
    <>
    <Stack gap = {2}>
        <Row>
            <FigureMonitor figure = {figure} formControl = {formControl}/>
        </Row>
        <Row>
            <StateBar progress = {progress}/> 
        </Row>
    </Stack>

    </>
    )
}

export {MonitorPanel, progressHandle}