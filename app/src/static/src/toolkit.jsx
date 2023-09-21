import {useState} from 'react'
import Form from 'react-bootstrap/Form'

/**
 * @brief Checking of value correction in field: array size and belonging value of each element to specified range.
 * @param value string
 * @param dimension number
 * @param range number
 * @return result = {error: false, message: 'message'}
 */
function NumericHandleValidate(value, dimension, range) {
    function isValidJsonString(jsonString) {    
        if(!(jsonString && typeof jsonString === 'string')) {
            return false
        }    
        try {
            JSON.parse(jsonString);
            return true
        } catch(error) {
            return false
        }    
    }

    let message = 'Value is correct.'
    let state = false
    let line = value
    if (isValidJsonString(line)) {
        let object = JSON.parse(line) 
        if (typeof object == 'number' && dimension == 1) {
            let value = object
            state = (!isNaN(value)) ? ((value >= range[0] && value <= range[1]) ? true : false) : false
            if (!state) {
                message = `Data must be a single value in range: ${JSON.stringify(range)}.`
            }
        }
        else {
            // check length array
            if (object.length == dimension) {
                // check belonging each element to given range
                for (let index in object) {
                    let value = object[index]
                    state = (!isNaN(value)) ? ((value >= range[0] && value <= range[1]) ? true : false) : false
                }
                if (!state) {
                    message = `Data must be an array with elements in range: ${JSON.stringify(range)}.`
                }
            } else {
                state = false
                message = `Data must be an array of given size: ${dimension}.`
            }
        }
    } else {
        state = false
        if (dimension == 1) {
            message = `Data must be number.`
        } else {
            message = `Data must be presented in JSON format.`
        }
    }
    return {error: !state, message: message}
}

const NumberInputPattern = (prop) => {
    return <NumericInputPattern {...prop}
        value = {JSON.stringify(prop.value)}
        handleValidate = {
            (value) => {return NumericHandleValidate(value, 1, prop.range)}
        }
    />
}

const ArrayInputPattern = (prop) => {
    return <NumericInputPattern {...prop}
        value = {JSON.stringify(prop.value)}
        handleValidate = {
            (value) => {return NumericHandleValidate(value, prop.dim, prop.range)}
        }
    />
}

const NumericInputPattern = (prop) => {
    const [value, setValue] = useState({data: prop.value || '', 
        error: prop.handleValidate(prop.value).error})
    const [feedback, setFeedback] = useState(prop.feedback)

    const handleChange = (event) => {
        let value = event.target.value
        let result = prop.handleValidate(value)
        console.log(result)
        setFeedback(result.message)
        setValue({data: value, error: result.error})
    }

    return (
        <>
            <Form.Group className = 'mb-2'>
                <Form.FloatingLabel label= {prop.label}>
                    <Form.Control type = 'text' name = {prop.name} value = {value.data} 
                        onChange = {handleChange} 
                        required = {prop.required} 
                        isInvalid = {value.error} 
                        isValid = {!value.error}
                    />
                    <Form.Control.Feedback type = {value.error ? 'invalid' : 'valid'}>
                        {value.error && feedback}
                    </Form.Control.Feedback>
                </Form.FloatingLabel>
            </Form.Group>
        </>
    )
}

const FormPattern = ({children, formControl}) => {
    const [validated, setValidated] = useState(true)

    const handleSubmit = (event) => {
        event.preventDefault()
        event.stopPropagation()
        let form = event.currentTarget
        if (form.checkValidity()) {
            let formDataLoc = new FormData(form)
            let obj = Object.fromEntries(formDataLoc.entries())
    
            // convert serialized array to array object
            Object.entries(obj).forEach(([key, value]) => {
                try {
                    let val = JSON.parse(value)
                    if (Array.isArray(val) || typeof(val) == 'number') {
                        obj[key] = val
                    }
                } catch {
    
                }
            })
            formControl.setFormData(obj)
        }
    }

    return (
    <>
    <Form onSubmit = {handleSubmit}>
        <fieldset disabled = {formControl.formDisabled}>
            {children}
        </fieldset>
    </Form>
    </>
    )
}

const PlaceholderPattern = ({children, state, type, xs}) => {

    const renderSwitch = (type) => {
        switch (type) {
            case 'button':
                return <Placeholder.Button xs = {xs}/>
            case 'image':
                return <PlaceholderImagePattern/>
            default:
                return <Placeholder xs = {xs}/>
        }
    }

    return (
    <>
    {
        state ?
        <>{children}</>
        :
        <Placeholder animation = 'glow'>
            {renderSwitch(type)}
        </Placeholder>
    }
    </>
    )
}

export {NumberInputPattern, ArrayInputPattern, FormPattern, PlaceholderPattern}