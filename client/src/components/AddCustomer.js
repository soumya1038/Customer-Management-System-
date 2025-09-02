import { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RotatingLines } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import './AddCustomer.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
class AddCustomer extends Component {

    state = {
        first_name: '',
        last_name: '',
        phone_number: '',
        error: null,
        loading: false,
    };

    onChangeFirstName = (event) => this.setState({ first_name: event.target.value });
    onChangeLastName = (event) => this.setState({ last_name: event.target.value });
    onChangePhoneNumber = (event) => this.setState({ phone_number: event.target.value });

    onSubmit = async (event) => {
        this.setState({ loading: true, error: null })

        event.preventDefault();
        const { first_name, last_name, phone_number } = this.state;
        // console.log(customer)
        if (!first_name.trim() || !last_name.trim() || !phone_number.trim()) {
            this.setState({ error: 'All fields are required', loading: false });
            return;
        }

        try {
            const payload = {
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                phone_number: phone_number.trim(),
            };

            const response = await axios.post(`${API_BASE}/api/customers`, payload);
            // console.log(response.data.data.id)
            // refresh list and clear form
            this.setState({ first_name: '', last_name: '', phone_number: '', loading: false, error: null });
            const createdId = response.data.data.id;
            // navigate to the new customer page 
            if (this.props.navigate && createdId) {
                // NOTE: make sure your route is defined as /add-customer/:id (or change this path)
                this.props.navigate(`/add-customer/${createdId}`);
            }
        } catch (err) {
            console.error(err);
            const message =
                err.response?.data?.message ||
                (err.response?.data?.errors && err.response.data.errors.join(', ')) ||
                err.message ||
                'Failed to create customer';
            this.setState({ error: message, loading: false });
        }
    }

    cancelForm = () => {
        this.setState({ first_name: '', last_name: '', phone_number: '' });
        this.props.navigate('/');
    }

    render() {
        const { first_name, last_name, phone_number, error, loading } = this.state;
        return (
            <div className="add-customer-container">
                <header className="add-customer-header">
                    <Link to='/'>
                    <h1>Customer Management System 🛃</h1>
                    </Link>
                </header>

                {!loading && (
                    <div className="form-container">
                        <h1 className="form-title">Create New Customer</h1>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <form onSubmit={this.onSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={first_name}
                                        onChange={this.onChangeFirstName}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={last_name}
                                        onChange={this.onChangeLastName}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Phone Number (XXX-XXX-XXXX)
                                </label>
                                <input
                                    type="text"
                                    value={phone_number}
                                    onChange={this.onChangePhoneNumber}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={this.cancelForm} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Customer</button>
                            </div>
                        </form>
                    </div>
                )}
                {loading && <div className="loader-container" data-testid="loader">
                    <RotatingLines type="TailSpin" color="#3581fbff" height={50} width={50} />
                </div>}
            </div>
        )
    }
}

// Functional wrapper to inject `navigate` into the class component.
// This prevents using hooks inside a class component and avoids the invalid hook call error.
export default function AddCustomerWrapper(props) {
  const navigate = useNavigate();
  return <AddCustomer {...props} navigate={navigate} />;
}


