// const Add = () => {
//     return (<form action="http://localhost:5000/api/upload" method="post" enctype="multipart/form-data">
//             <input type="text" name="title" placeholder="Title" required/>
//             <input type="text" name="artist" placeholder="Artist" required/>
//             <input type="text" name="album" placeholder="Album"/>
//             <input type="number" name="duration" placeholder="Duration (in seconds)" required/>
//             <input type="file" name="audioFile" required/>
//             <button type="submit">Upload</button>
//         </form>)
// }
import React, { useState } from 'react';
import { Button, Input, Modal, Form } from 'antd';
import axios from 'axios';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 2, span: 22 },
    labelCol: { span: 2 },
};

const Add = ({ onClose }) => {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [formRef] = Form.useForm();

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        formRef.validateFields().then((values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key === 'audioFile') {
                    return;
                }
                formData.append(key, values[key]);
            });
            formData.append('audioFile', file);
            formData.append('duration', 99999);
            axios.post('http://localhost:5000/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((response) => {
                console.log('Song uploaded successfully:', response.data);
                setOpen(false);
                onClose && onClose(response.data)
            });
        }).catch((info) => {
            console.log('Validation failed:', info);
        }).finally(() => {
            setConfirmLoading(false);
        });
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };



    return (
        <>
            <Button type="primary" onClick={showModal}>
                Add Song
            </Button>
            <Modal
                title="Title"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                closable={false}
            >
                <Form
                    {...layout}
                    form={formRef}
                >
                    <Form.Item
                        {...tailLayout}
                        name='title'
                        label="Title"
                        rules={[{ required: true, message: 'Please input your Title!' }]}
                    >
                        <Input
                            placeholder="Title"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        {...tailLayout}
                        name='artist'
                        label="Artist"
                    >
                        <Input
                            placeholder="Artist"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        {...tailLayout}
                        name='album'
                        label="Album"
                    >
                        <Input
                            placeholder="Album"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        {...tailLayout}
                        name='audioFile'
                        label="File"
                    >
                        <Input
                            type='file'
                            placeholder="audioFile"
                            required
                            accept=".mp3,.wav"
                            onChange={(e) => {
                                setFile(e.target.files[0]);
                            }}
                        />
                    </Form.Item>
                </Form>

            </Modal >
        </>
    );
};

// export default App;

export default Add;