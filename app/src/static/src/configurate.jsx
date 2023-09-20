import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {NumberInputPattern, ArrayInputPattern, FormPattern} from './toolkit'

const FormNavierStoksCylinder = () => {

    return (
    <>
    <Row>
        <Col>
            <Alert variant = 'light'>Geometry parameters</Alert>
        </Col>
        <Col>
            <ArrayInputPattern label = 'Rectangle [x1, x2, y1, y2]' name = 'rectangle' 
                value = {[0, 0, 2, 0.5]} dim = {4} range = {[0, 10]}
            />
        </Col>
        <Col>
            <ArrayInputPattern label = 'Circle [x, y, d]' name = 'circle' 
                value = {[0.25, 0.25, 0.5]} dim = {3} range = {[0, 10]}
            />
        </Col>
    </Row>
    <Row>
        <Col>
            <Alert variant = 'light'>Solver parameters</Alert>
        </Col>
        <Col>
            <NumberInputPattern label = 'Time [s]' name = 'time' 
                value = {1} range = {[0, 10]}
            />
        </Col>
        <Col>
            <NumberInputPattern label = 'Time node' name = 'tn' 
                value = {100} range = {[2, 1000]}
            />
        </Col>
        <Col>
            <NumberInputPattern label = 'Mesh node' name = 'mn' 
                value = {100} range = {[2, 1000]}
            />
        </Col>
    </Row>
    <Row>
        <Col>
            <Alert variant = 'light'>Physics properties</Alert>
        </Col>
        <Col>
            <NumberInputPattern label = 'Density' name = 'density' 
                value = {1} range = {[0.0001, 10]}
            />
        </Col>
        <Col>
            <NumberInputPattern label = 'Viscosity' name = 'viscosity' 
                value = {0.001} range = {[0.0001, 10]}
            />
        </Col>
    </Row>
    </>
    )
}

const ConfiguratePanel = ({formControl}) => {

    return (
    <>
        <FormPattern formControl = {formControl} children = {
            <>
                <FormNavierStoksCylinder/>
                <Row>
                    <Button type = 'submit' variant = 'primary'>
                        {formControl.formDisabled ? 'Processing' : 'Process'}
                    </Button>
                </Row>
            </>
        }/>
    </>
    )
}

export {ConfiguratePanel}