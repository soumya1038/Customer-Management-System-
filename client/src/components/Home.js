// src/components/Home.js
import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { RotatingLines } from 'react-loader-spinner';
import './Home.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class Home extends Component {
  state = {
    customers: [],
    loading: false,
    searchInput: '',   // user input for search (searches name/phone using q)
    page: 1,
    limit: 10,
    totalPages: 1,
    error: null,
  };

  // used for debounce
  searchDebounce = null;
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.fetchCustomers(); // initial load
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  // Build params and call backend
  fetchCustomers = async () => {
    const { searchInput, page, limit } = this.state;

    this.setState({ loading: true, error: null });
    try {
      const params = {
        // send q param for name/phone search
        ...(searchInput && searchInput.trim() ? { q: searchInput.trim() } : {}),
        page,
        limit,
        // if you'd like to support city filter separately, add { city } here
      };

      const res = await axios.get(`${API_BASE}/api/customers`, { params });

      // guard if component unmounted
      if (!this._isMounted) return;

      const list = Array.isArray(res.data.data) ? res.data.data : [];
      const meta = res.data.meta || {};
      this.setState({
        customers: list,
        totalPages: meta.totalPages || 1,
      });
    } catch (err) {
      console.error(err);
      if (!this._isMounted) return;
      this.setState({
        error: err.response?.data?.message || err.message || 'Failed to fetch customers',
      });
    } finally {
      if (!this._isMounted) return;
      this.setState({ loading: false });
    }
  };

  // Debounced handler for search input
  onChangeInput = (e) => {
    const v = e.target.value;
    // update input and debounce the fetch
    this.setState({ searchInput: v, page: 1 }, () => {
      if (this.searchDebounce) clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.fetchCustomers();
      }, 400);
    });
  };

  goToPage = (newPage) => {
    const page = Math.max(1, Math.min(newPage, this.state.totalPages || 1));
    this.setState({ page }, () => this.fetchCustomers());
  };

  nextPage = () => this.goToPage(this.state.page + 1);
  prevPage = () => this.goToPage(this.state.page - 1);

  renderInitials = (c) => {
    const fn = (c.first_name || '').trim();
    const ln = (c.last_name || '').trim();
    const a = fn ? fn[0].toUpperCase() : '';
    const b = ln ? ln[0].toUpperCase() : '';
    const initials = (a || b) ? `${a}${b}` : '?';
    return <div className="customer-avatar">{initials}</div>;
  };

  render() {
    const { customers, loading, searchInput, page, totalPages, error } = this.state;

    return (
      <div className="home-container">
        <header className="home-header">
          <Link to='/'>
            <h1>Customer Management System 🛃</h1>
          </Link>
        </header>

        <div className="home-content">
          <h1 className="home-title">Customers</h1>

          <div className="search-section">
            <input
              type="text"
              value={searchInput}
              placeholder="Search by name or phone..."
              onChange={this.onChangeInput}
              className="search-input"
            />
            <Link to="/add-customer" className="add-customer-btn">+ New Customer</Link>
          </div>

          {loading && (
            <div className="loader-container" data-testid="loader">
              <RotatingLines height={50} width={50} strokeWidth={4} />
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <ul className="customers-list">
            {customers.map((customer) => (
              <li key={customer.id} className="customer-item">
                <Link to={`/add-customer/${customer.id}`} className="customer-link">
                  {this.renderInitials(customer)}
                  <div className="customer-info">
                    <p className="customer-name">{customer.first_name || '-'} {customer.last_name || '-'}</p>
                    <p className="customer-phone">{customer.phone_number || '-'}</p>
                  </div>
                  <div className="customer-meta">{customer.addresses_count || 0} addr</div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button onClick={this.prevPage} disabled={page <= 1} className="pagination-btn">Prev</button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <button onClick={this.nextPage} disabled={page >= totalPages} className="pagination-btn">Next</button>

            <div className="page-jump">
              Jump to page:
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1;
                  this.goToPage(val);
                }}
                className="page-jump-input"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
