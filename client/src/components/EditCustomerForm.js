// src/components/EditCustomerForm.js
import React, { Component } from 'react';
import axios from 'axios';
import './EditCustomerForm.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Props:
 *  - customerId (number or string)          // required
 *  - initialValue: { first_name, last_name, phone_number }  // prefill values
 *  - onSaved(updatedCustomer)               // called when PUT succeeds
 *  - onCancel()                             // called when user cancels
 */
class EditCustomerForm extends Component {
  constructor(props) {
    super(props);
    const initial = props.initialValue || {};
    this.state = {
      first_name: initial.first_name || '',
      last_name: initial.last_name || '',
      phone_number: initial.phone_number || '',
      loading: false,
      error: null,
    };
  }

  onChangeFirstName = (e) => this.setState({ first_name: e.target.value });
  onChangeLastName = (e) => this.setState({ last_name: e.target.value });
  onChangePhoneNumber = (e) => this.setState({ phone_number: e.target.value });

  onCancel = () => {
    if (typeof this.props.onCancel === 'function') this.props.onCancel();
  };

  onSave = async (e) => {
    e.preventDefault();
    const { customerId } = this.props;
    const { first_name, last_name, phone_number } = this.state;

    // Basic validation
    if (!first_name.trim() || !last_name.trim() || !phone_number.trim()) {
      this.setState({ error: 'All fields are required' });
      return;
    }

    // Basic phone validation (adjust to your format)
    const cleaned = phone_number.replace(/[\s-]/g, '');
    if (!/^\+?\d{6,15}$/.test(cleaned)) {
      this.setState({ error: 'Phone number looks invalid' });
      return;
    }

    try {
      this.setState({ loading: true, error: null });

      const payload = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone_number: phone_number.trim(),
      };

      // PUT to update customer
      const res = await axios.put(`${API_BASE}/api/customers/${customerId}`, payload);
      // expected server returns updated customer in res.data.data
      const updated = res?.data?.data || null;

      // Notify parent
      if (typeof this.props.onSaved === 'function') {
        this.props.onSaved(updated);
      }
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && err.response.data.errors.join(', ')) ||
        err.message ||
        'Failed to update customer';
      this.setState({ error: message });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { first_name, last_name, phone_number, loading, error } = this.state;

    return (
      <div className="edit-customer-form">
        <h3 className="edit-form-title">Edit Customer</h3>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={this.onSave}>
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
            <button type="button" onClick={this.onCancel} disabled={loading} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default EditCustomerForm;
