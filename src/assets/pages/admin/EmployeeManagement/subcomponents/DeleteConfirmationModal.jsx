import { Modal, Button } from "antd";

const DeleteConfirmationModal = ({ visible, onConfirm, onCancel, userName }) => {
    return (
        <Modal
            title="Confirm Deletion"
            open={visible}
            onOk={onConfirm}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" danger onClick={onConfirm}>
                    Delete
                </Button>,
            ]}
        >
            <p>
                Are you sure you want to delete user "<strong>{userName}</strong>
                "? This action cannot be undone.
            </p>
        </Modal>
    );
};

export default DeleteConfirmationModal;