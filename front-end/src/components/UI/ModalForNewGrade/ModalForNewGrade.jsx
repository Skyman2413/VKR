import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalForNewGrade = ({show, handleClose, handleSubmit, grade, setGrade, comment, setComment, grade_type, setType}) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Введите оценку и комментарий</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formGrade">
                        <Form.Label>Оценка</Form.Label>
                        <Form.Control type="text" placeholder="Введите оценку" value={grade} onChange={(e) => setGrade(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="formComment">
                        <Form.Label>Комментарий</Form.Label>
                        <Form.Control type="text" placeholder="Введите комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId="formType">
                        <Form.Label>Тип оценки</Form.Label>
                        <Form.Control type="text" placeholder="Введите тип оценки" value={grade_type} onChange={(e) => setType(e.target.value)} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Закрыть
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Сохранить изменения
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalForNewGrade;
