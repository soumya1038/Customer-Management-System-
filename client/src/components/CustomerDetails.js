// 


// src/components/CustomerDetails.js
import React, { Component } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddressForm from './AddressForm';
import EditCustomerForm from './EditCustomerForm';
import './CustomerDetails.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class CustomerDetails extends Component {
    state = {
        customer: null,
        addresses: [],
        loadingCustomer: false,
        error: null,

        // form state
        showForm: false,
        savingAddress: false,
        // editingAddress: null means "create" mode; otherwise contains address object to edit
        editingAddress: null,
        // controlled form fields:
        address_details: '',
        city: '',
        state: '',
        pin_code: '',
        editingCustomer: false,
        savingCustomer: false,
    };

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(prevProps) {
        // if route id changed, reload
        if (prevProps.id !== this.props.id) {
            this.getData();
        }
    }

    getData = async () => {
        const { id } = this.props;
        if (!id) return;

        this.setState({ loadingCustomer: true, error: null });
        try {
            const res = await axios.get(`${API_BASE}/api/customers/${id}`);
            const customer = res.data.data || null;
            const addresses = (customer && customer.addresses) || [];
            this.setState({ customer, addresses });
        } catch (err) {
            console.error(err);
            this.setState({ error: err?.response?.data?.message || err.message || 'Failed to load customer' });
        } finally {
            this.setState({ loadingCustomer: false });
        }
    };

    // Open create form: reset form values and editingAddress = null
    openCreateForm = () => {
        this.setState({
            showForm: true,
            editingAddress: null,
            address_details: '',
            city: '',
            state: '',
            pin_code: '',
        });
    };

    // Open edit form for a specific address: populate fields from addr
    openEditForm = (addr) => {
        this.setState({
            showForm: true,
            editingAddress: addr,
            address_details: addr.address_details || '',
            city: addr.city || '',
            state: addr.state || '',
            pin_code: addr.pin_code || '',
        });
    };

    // Cancel form
    onCancelForm = () => {
        this.setState({
            showForm: false,
            editingAddress: null,
            address_details: '',
            city: '',
            state: '',
            pin_code: '',
        });
    };

    // Save address (create or update depending on editingAddress)
    saveAddress = async () => {
        const { id } = this.props; // customer id
        const { editingAddress, address_details, city, state, pin_code } = this.state;

        // simple validation
        if (!address_details.trim() || !city.trim() || !state.trim() || !pin_code.trim()) {
            this.setState({ error: 'All address fields are required' });
            return;
        }

        const payload = {
            address_details: address_details.trim(),
            city: city.trim(),
            state: state.trim(),
            pin_code: pin_code.trim(),
        };

        try {
            this.setState({ savingAddress: true, error: null });

            if (editingAddress && editingAddress.id) {
                // Update
                await axios.put(`${API_BASE}/api/addresses/${editingAddress.id}`, payload);
            } else {
                // Create
                await axios.post(`${API_BASE}/api/customers/${id}/addresses`, payload);
            }

            // After success: close form and reload addresses from server
            this.setState({
                showForm: false,
                editingAddress: null,
                address_details: '',
                city: '',
                state: '',
                pin_code: '',
                savingAddress: false,
            }, () => {
                // callback after state applied
                this.getData();
            });
        } catch (err) {
            console.error(err);
            this.setState({
                error: err?.response?.data?.message || err.message || 'Failed to save address',
                savingAddress: false,
            });
        }
    };

    // Delete address
    deleteAddress = async (addrId) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await axios.delete(`${API_BASE}/api/addresses/${addrId}`);
            // reload
            this.getData();
        } catch (err) {
            console.error(err);
            this.setState({ error: err?.response?.data?.message || err.message || 'Failed to delete address' });
        }
    };

    // Edit customer placeholder (you can implement PUT /api/customers/:id)
    // onEditCustomer: open edit form
    onEditCustomer = () => {
        const { customer } = this.state;
        if (!customer) return;
        this.setState({ editingCustomer: true });
    };

    // onSaved callback: called by form after successful PUT
    onCustomerSaved = (updatedCustomer) => {
        // Option A: use returned updatedCustomer if server returned it
        if (updatedCustomer) {
            this.setState({ customer: updatedCustomer, editingCustomer: false });
            return;
        }

        // Option B: otherwise re-fetch from server to ensure consistency
        this.setState({ editingCustomer: false }, () => {
            this.getData();
        });
    };

    // cancel handler
    cancelEditCustomer = () => {
        this.setState({ editingCustomer: false });
    };
    onDeleteCustomer = async () => {
        const { id, navigate } = this.props;
        if (!id) return;
        if (!window.confirm('Delete this customer? This will remove all addresses too.')) return;

        try {
            await axios.delete(`${API_BASE}/api/customers/${id}`);
            // navigate back to list
            if (navigate) navigate('/');
        } catch (err) {
            console.error(err);
            this.setState({ error: err?.response?.data?.message || err.message || 'Failed to delete customer' });
        }
    };

    // handlers for controlled inputs
    onChangeAddressDetails = (e) => this.setState({ address_details: e.target.value });
    onChangeCity = (e) => this.setState({ city: e.target.value });
    onChangeState = (e) => this.setState({ state: e.target.value });
    onChangePinCode = (e) => this.setState({ pin_code: e.target.value });

    render() {
        const { customer, addresses, loadingCustomer, showForm, editingAddress, savingAddress, error, address_details, city, state, pin_code } = this.state;

        return (
            <div className="customer-details-container">
                <header className="customer-details-header">
                    <Link to='/'>
                        <h1>Customer Management System 🛃</h1>
                    </Link>
                    <Link to="/add-customer" className="header-add-btn">Add Customer</Link>
                </header>
                
                {loadingCustomer && <p className="loading-message">Loading customer...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loadingCustomer && customer && (
                    <div className="customer-card">
                        <div className="customer-info">
                            <h2 className="customer-name">{customer?.first_name} {customer?.last_name}</h2>
                            <p className="customer-phone">{customer?.phone_number}</p>
                        </div>
                        <div className="customer-actions">
                            <button onClick={this.onEditCustomer} className="btn btn-primary">Edit</button>
                            <button onClick={this.onDeleteCustomer} className="btn btn-danger">Delete</button>
                        </div>
                    </div>
                )}
                
                {this.state.editingCustomer && (
                    <div className="edit-form-container">
                        <EditCustomerForm
                            customerId={this.props.id}
                            initialValue={this.state.customer}
                            onSaved={this.onCustomerSaved}
                            onCancel={this.cancelEditCustomer}
                        />
                    </div>
                )}

                {!this.state.editingCustomer && (
                    <div className="addresses-section">
                        <h3 className="addresses-title">Addresses</h3>
                        <button onClick={this.openCreateForm} className="btn btn-primary">Add Address</button>

                        {addresses.length === 0 ? (
                            <p className="no-addresses">No addresses found for this customer.</p>
                        ) : !showForm && (
                            <ul className="addresses-list">
                                {addresses.map(addr => (
                                    <li key={addr.id} className="address-item">
                                        <div className="address-text">
                                            {addr.address_details}, {addr.city}, {addr.state} - {addr.pin_code}
                                        </div>
                                        <div className="address-actions">
                                            <button type="button" onClick={() => this.openEditForm(addr)} className="btn btn-secondary btn-small">Edit</button>
                                            <button type="button" onClick={() => this.deleteAddress(addr.id)} className="btn btn-danger btn-small">Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {showForm && (
                    <AddressForm
                        value={{ address_details, city, state, pin_code }}
                        onChangeAddressDetails={this.onChangeAddressDetails}
                        onChangeCity={this.onChangeCity}
                        onChangeState={this.onChangeState}
                        onChangePinCode={this.onChangePinCode}
                        onSave={this.saveAddress}
                        onCancel={this.onCancelForm}
                        isEditing={!!editingAddress}
                        saving={savingAddress}
                    />
                )}
            </div>
        );
    }
}

// wrapper to inject router hooks into class component
export default function CustomerDetailsWrapper(props) {
    const params = useParams();
    const navigate = useNavigate();
    return <CustomerDetails id={params.id} navigate={navigate} {...props} />;
}
