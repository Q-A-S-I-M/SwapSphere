import React, { useEffect, useState } from "react";
import "../styles/UserWalletPage.css";
import axios from "../api/axios";
import Modal from "../components/Modal";
import SuccessModal from "../components/SuccessModal";
import ItemTabs from "../components/ItemTabs";
import { useAuth } from "../context/AuthContext";
import {
  validateUsername,
  validateTokens,
  filterUsername,
  validateCardholderName,
  validateCardNumber,
  validateExpirationDate,
  validateCVV,
  filterCardholderName
} from "../utils/validation";

export default function UserWalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    tokensAvailable: 0,
    tokensSpent: 0
  });

  const [swapUsage, setSwapUsage] = useState([]);
  const [featureUsage, setFeatureUsage] = useState([]);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: "" });
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingItemDetails, setViewingItemDetails] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    tokens: 0,
    usdAmount: 0
  });
  
  // Payment form validation errors
  const [paymentFieldErrors, setPaymentFieldErrors] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    tokens: ""
  });

  const [transferForm, setTransferForm] = useState({
    username: "",
    tokens: 0
  });
  
  // Transfer form validation errors
  const [transferFieldErrors, setTransferFieldErrors] = useState({
    username: "",
    tokens: ""
  });

  // Fetch wallet & usages
  useEffect(() => {
    if (!user?.username) return;

    const fetchData = async () => {
      try {
        const walletRes = await axios.get(`/wallet/${user.username}`);
        setWallet(walletRes.data);

        const [swapRes, featureRes] = await Promise.all([
          axios.get(`/tokens/swaps/${user.username}`),
          axios.get(`/tokens/features/${user.username}`)
        ]);

        setSwapUsage(swapRes.data || []);
        setFeatureUsage(featureRes.data || []);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        const errorMsg = err.response?.data || err.message || "Failed to load wallet data";
        alert(`Failed to load wallet data: ${errorMsg}`);
      }
    };

    fetchData();
  }, [user]);

  // Handlers
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let validation = { isValid: true, error: "" };
    
    if (name === "tokens") {
      const tokens = parseFloat(value) || 0;
      const usdAmount = tokens / 5; // 1 USD = 5 tokens
      setPaymentForm(prev => ({ ...prev, tokens: tokens, usdAmount: usdAmount }));
      validation = validateTokens(tokens);
      setPaymentFieldErrors(prev => ({ ...prev, tokens: validation.error }));
    } else if (name === "cardNumber") {
      // Format card number: add spaces every 4 digits
      const digitsOnly = value.replace(/\s/g, '').replace(/\D/g, '');
      const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || digitsOnly;
      setPaymentForm(prev => ({ ...prev, [name]: formatted.substring(0, 19) }));
      validation = validateCardNumber(formatted);
      setPaymentFieldErrors(prev => ({ ...prev, cardNumber: validation.error }));
    } else if (name === "expirationDate") {
      // Format expiration date: MM/YY
      const digitsOnly = value.replace(/\D/g, '');
      let formatted = digitsOnly;
      if (digitsOnly.length >= 2) {
        formatted = digitsOnly.substring(0, 2) + '/' + digitsOnly.substring(2, 4);
      }
      setPaymentForm(prev => ({ ...prev, [name]: formatted.substring(0, 5) }));
      validation = validateExpirationDate(formatted);
      setPaymentFieldErrors(prev => ({ ...prev, expirationDate: validation.error }));
    } else if (name === "securityCode") {
      // Only allow digits, max 4 characters
      const digitsOnly = value.replace(/\D/g, '');
      setPaymentForm(prev => ({ ...prev, [name]: digitsOnly.substring(0, 4) }));
      validation = validateCVV(digitsOnly);
      setPaymentFieldErrors(prev => ({ ...prev, securityCode: validation.error }));
    } else if (name === "cardholderName") {
      // Allow letters, spaces, hyphens, and apostrophes
      const filtered = filterCardholderName(value);
      setPaymentForm(prev => ({ ...prev, [name]: filtered }));
      validation = validateCardholderName(filtered);
      setPaymentFieldErrors(prev => ({ ...prev, cardholderName: validation.error }));
    } else {
      setPaymentForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBuyTokens = async () => {
    // Validate all fields
    const cardholderValidation = validateCardholderName(paymentForm.cardholderName);
    const cardNumberValidation = validateCardNumber(paymentForm.cardNumber);
    const expirationValidation = validateExpirationDate(paymentForm.expirationDate);
    const cvvValidation = validateCVV(paymentForm.securityCode);
    const tokensValidation = validateTokens(paymentForm.tokens);
    
    const newFieldErrors = {
      cardholderName: cardholderValidation.error,
      cardNumber: cardNumberValidation.error,
      expirationDate: expirationValidation.error,
      securityCode: cvvValidation.error,
      tokens: tokensValidation.error
    };
    
    setPaymentFieldErrors(newFieldErrors);
    
    if (!cardholderValidation.isValid || !cardNumberValidation.isValid || 
        !expirationValidation.isValid || !cvvValidation.isValid || 
        !tokensValidation.isValid) {
      alert("Please fix the errors in the form.");
      return;
    }

    try {
      const tokensPurchased = Number(paymentForm.tokens);
      const amountPaid = paymentForm.usdAmount;
      
      await axios.put("/wallet/buy", {
        user: { username: user.username },
        amountPaid: amountPaid, // Auto-calculated: tokens / 5
        tokensPurchased: tokensPurchased,
      });

      // Refresh wallet
      const walletRes = await axios.get(`/wallet/${user.username}`);
      setWallet(walletRes.data);
      
      // Store message before closing modal
      const successMessage = `Payment successful! You have purchased ${tokensPurchased} token${tokensPurchased !== 1 ? 's' : ''}.`;
      
      handleCloseBuyModal();
      setSuccessModal({ 
        open: true, 
        message: successMessage
      });
    } catch (err) {
      console.error(err);
      alert("Failed to buy tokens: " + (err.response?.data?.message || err.message));
    }
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    let validation = { isValid: true, error: "" };
    
    if (name === "username") {
      filteredValue = filterUsername(value);
      validation = validateUsername(filteredValue);
    } else if (name === "tokens") {
      const numValue = Number(value);
      validation = validateTokens(numValue);
    }
    
    setTransferForm(prev => ({ ...prev, [name]: name === "tokens" ? Number(filteredValue) || 0 : filteredValue }));
    setTransferFieldErrors(prev => ({ ...prev, [name]: validation.error }));
  };

  const handleCloseBuyModal = () => {
    setBuyModalOpen(false);
    setPaymentForm({
      cardholderName: "",
      cardNumber: "",
      expirationDate: "",
      securityCode: "",
      tokens: 0,
      usdAmount: 0
    });
    setPaymentFieldErrors({
      cardholderName: "",
      cardNumber: "",
      expirationDate: "",
      securityCode: "",
      tokens: ""
    });
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setTransferForm({
      username: "",
      tokens: 0
    });
    setTransferFieldErrors({
      username: "",
      tokens: ""
    });
  };

  const handleTransferTokens = async () => {
    // Validate fields
    const usernameValidation = validateUsername(transferForm.username);
    const tokensValidation = validateTokens(transferForm.tokens);
    
    setTransferFieldErrors({
      username: usernameValidation.error,
      tokens: tokensValidation.error
    });
    
    if (!usernameValidation.isValid || !tokensValidation.isValid) {
      alert("Please fix the errors in the form.");
      return;
    }

    if (transferForm.tokens > wallet.tokensAvailable) {
      alert("Not enough available tokens to transfer");
      return;
    }

    try {
      const tokensTransferred = Number(transferForm.tokens);
      const recipientUsername = transferForm.username;
      
      await axios.put(`/wallet/transfer/${user.username}`, { 
        username: recipientUsername,
        tokens: tokensTransferred
      });
      // Refresh wallet and usage logs
      const [walletRes, swapRes, featureRes] = await Promise.all([
        axios.get(`/wallet/${user.username}`),
        axios.get(`/tokens/swaps/${user.username}`),
        axios.get(`/tokens/features/${user.username}`)
      ]);
      setWallet(walletRes.data);
      setSwapUsage(swapRes.data || []);
      setFeatureUsage(featureRes.data || []);
      handleCloseTransferModal();
      setSuccessModal({ 
        open: true, 
        message: `Transfer successful! You have transferred ${tokensTransferred} token${tokensTransferred !== 1 ? 's' : ''} to ${recipientUsername}.` 
      });
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to transfer tokens.";
      
      if (err.response?.data) {
        // Backend returns error message as string in response body
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleViewOfferedItem = async (itemId) => {
    if (!itemId) return;
    
    setLoadingItem(true);
    setViewingItem(itemId);
    
    try {
      const response = await axios.get(`/offer-items/get-item/${itemId}`);
      const data = response.data;
      
      // Handle nested structure: { offeredItem: {...}, images: [...] }
      let itemData = data;
      let images = [];
      
      if (data.offeredItem) {
        // Backend returns nested structure from OfferedItemWithImages DTO
        itemData = data.offeredItem;
        images = data.images || [];
      } else {
        // Already flat structure or direct item
        itemData = data;
        images = data.images || [];
      }
      
      // Merge images into itemData for easier access
      itemData.images = images;
      
      setViewingItemDetails(itemData);
    } catch (err) {
      console.error("Error fetching item details:", err);
      alert("Failed to load item details: " + (err.response?.data || err.message));
      setViewingItem(null);
    } finally {
      setLoadingItem(false);
    }
  };

  const handleCloseItemView = () => {
    setViewingItem(null);
    setViewingItemDetails(null);
  };

  return (
    <div className="wallet-page-root">
      <h2>User Wallet</h2>

      <div className="wallet-overview">
        <div className="wallet-card">
          <div>Available Tokens</div>
          <div className="wallet-value">{wallet.tokensAvailable || 0}</div>
        </div>
        <div className="wallet-card">
          <div>Spent Tokens</div>
          <div className="wallet-value">{wallet.tokensSpent || 0}</div>
        </div>
      </div>

      <div className="wallet-actions">
        <button onClick={() => setBuyModalOpen(true)}>Buy Tokens</button>
        <button onClick={() => setTransferModalOpen(true)}>Transfer Tokens</button>
      </div>

      {/* Tabs */}
      <ItemTabs
        offeredCount={swapUsage.length}
        wantedCount={featureUsage.length}
        offeredLabel="Transactions"
        wantedLabel="Feature Usage"
        showRatings={false}
        renderContent={(activeTab) => {
          if (activeTab === "offered") return (
            <div className="items-list">
              {swapUsage.length === 0 ? (
                <div className="usage-card">No transactions found.</div>
              ) : (
                swapUsage.map(s => {
                  const isSent = s.user?.username === user?.username;
                  const otherParty = isSent ? s.counterparty : s.user;
                  const transactionType = isSent ? "Sent" : "Received";
                  const transactionColor = isSent ? "#ff6b6b" : "#4caf50";
                  
                  return (
                    <div key={s.swapUsageId} className="usage-card" style={{
                      borderLeft: `4px solid ${transactionColor}`,
                      padding: '16px',
                      marginBottom: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ 
                            display: 'inline-block', 
                            padding: '4px 12px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            background: `${transactionColor}20`,
                            color: transactionColor,
                            marginBottom: '8px'
                          }}>
                            {transactionType}
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: transactionColor, marginTop: '4px' }}>
                            {isSent ? '-' : '+'}{s.tokensUsed} tokens
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#cccccc' }}>
                          {s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A"}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#ffffff', marginTop: '8px' }}>
                        <strong>{isSent ? 'To:' : 'From:'}</strong> {otherParty?.username || "N/A"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
          if (activeTab === "wanted") return (
            <div className="items-list">
              {featureUsage.length === 0 ? (
                <div className="usage-card">No feature usage logs found.</div>
              ) : (
                featureUsage.map(f => (
                  <div key={f.usageId} className="usage-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <strong>Usage ID:</strong> {f.usageId} <br/>
                        <strong>Feature Type:</strong> {f.featureType || "N/A"} <br/>
                        <strong>Tokens Used:</strong> {f.tokensUsed} <br/>
                        {f.offeredItem && <><strong>Offered Item ID:</strong> {f.offeredItem.offeredItemId} <br/></>}
                        {f.wantedItem && <><strong>Wanted Item ID:</strong> {f.wantedItem.wantedItemId} <br/></>}
                        <strong>Created:</strong> {f.createdAt ? new Date(f.createdAt).toLocaleString() : "N/A"}
                      </div>
                      {f.offeredItem && (
                        <button
                          onClick={() => handleViewOfferedItem(f.offeredItem.offeredItemId)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            marginLeft: '12px'
                          }}
                        >
                          View Item
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        }}
      />

      {/* Buy Tokens Modal */}
      {buyModalOpen && (
        <Modal onClose={handleCloseBuyModal} title="Buy Tokens">
          <div style={{ marginBottom: '16px' }}>
            <label>Cardholder Name</label>
            <input 
              type="text" 
              name="cardholderName" 
              placeholder="Enter cardholder name" 
              value={paymentForm.cardholderName} 
              onChange={handlePaymentChange}
              onBlur={(e) => {
                const validation = validateCardholderName(e.target.value);
                setPaymentFieldErrors(prev => ({ ...prev, cardholderName: validation.error }));
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: paymentFieldErrors.cardholderName ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: `2px solid ${paymentFieldErrors.cardholderName ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {paymentFieldErrors.cardholderName && (
              <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                {paymentFieldErrors.cardholderName}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Card Number</label>
            <input 
              type="text" 
              name="cardNumber" 
              placeholder="1234 5678 9012 3456" 
              value={paymentForm.cardNumber} 
              onChange={handlePaymentChange}
              onBlur={(e) => {
                const validation = validateCardNumber(e.target.value);
                setPaymentFieldErrors(prev => ({ ...prev, cardNumber: validation.error }));
              }}
              maxLength="19"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: paymentFieldErrors.cardNumber ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: `2px solid ${paymentFieldErrors.cardNumber ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {paymentFieldErrors.cardNumber && (
              <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                {paymentFieldErrors.cardNumber}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Expiration Date</label>
              <input 
                type="text" 
                name="expirationDate" 
                placeholder="MM/YY" 
                value={paymentForm.expirationDate} 
                onChange={handlePaymentChange}
                onBlur={(e) => {
                  const validation = validateExpirationDate(e.target.value);
                  setPaymentFieldErrors(prev => ({ ...prev, expirationDate: validation.error }));
                }}
                maxLength="5"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: paymentFieldErrors.expirationDate ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: `2px solid ${paymentFieldErrors.expirationDate ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {paymentFieldErrors.expirationDate && (
                <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                  {paymentFieldErrors.expirationDate}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label>CVV</label>
              <input 
                type="text" 
                name="securityCode" 
                placeholder="123" 
                value={paymentForm.securityCode} 
                onChange={handlePaymentChange}
                onBlur={(e) => {
                  const validation = validateCVV(e.target.value);
                  setPaymentFieldErrors(prev => ({ ...prev, securityCode: validation.error }));
                }}
                maxLength="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: paymentFieldErrors.securityCode ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: `2px solid ${paymentFieldErrors.securityCode ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {paymentFieldErrors.securityCode && (
                <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                  {paymentFieldErrors.securityCode}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ fontSize: '12px', color: '#ffffff', marginBottom: '8px', fontWeight: '500' }}>Purchase Amount</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#ffffff', marginBottom: '4px', display: 'block' }}>Tokens</label>
                <input 
                  type="number" 
                  name="tokens" 
                  placeholder="Enter tokens" 
                  value={paymentForm.tokens || ''} 
                  onChange={handlePaymentChange}
                  onBlur={(e) => {
                    const validation = validateTokens(Number(e.target.value));
                    setPaymentFieldErrors(prev => ({ ...prev, tokens: validation.error }));
                  }}
                  min="1" 
                  step="1"
                  style={{ 
                    width: '100%', 
                    background: paymentFieldErrors.tokens ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)', 
                    color: '#ffffff', 
                    border: `2px solid ${paymentFieldErrors.tokens ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`, 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                {paymentFieldErrors.tokens && (
                  <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                    {paymentFieldErrors.tokens}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '20px', color: '#ffffff', paddingBottom: '8px' }}>=</div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#ffffff', marginBottom: '4px', display: 'block' }}>USD Amount</label>
                <input 
                  type="text" 
                  name="usdAmount" 
                  value={paymentForm.usdAmount > 0 ? `$${paymentForm.usdAmount.toFixed(2)}` : '$0.00'} 
                  disabled 
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)', cursor: 'not-allowed', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '14px' }}
                />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', textAlign: 'center' }}>
              Exchange Rate: 1 USD = 5 Tokens
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
            <div style={{ fontSize: '12px', color: '#4caf50', marginBottom: '4px', fontWeight: '500' }}>Total Payment</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50' }}>
              {paymentForm.usdAmount > 0 ? `$${paymentForm.usdAmount.toFixed(2)}` : '$0.00'}
            </div>
            {paymentForm.tokens > 0 && (
              <div style={{ fontSize: '12px', color: 'rgba(76, 175, 80, 0.9)', marginTop: '4px' }}>
                You will receive {paymentForm.tokens} token{paymentForm.tokens !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <button onClick={handleBuyTokens}>Make Payment</button>
        </Modal>
      )}

      {/* Transfer Tokens Modal */}
      {transferModalOpen && (
        <Modal onClose={handleCloseTransferModal} title="Transfer Tokens">
          <div style={{ marginBottom: '16px' }}>
            <label>Recipient Username</label>
            <input 
              type="text" 
              name="username" 
              placeholder="Enter recipient username" 
              value={transferForm.username} 
              onChange={handleTransferChange}
              onBlur={(e) => {
                const validation = validateUsername(e.target.value);
                setTransferFieldErrors(prev => ({ ...prev, username: validation.error }));
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: transferFieldErrors.username ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: `2px solid ${transferFieldErrors.username ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {transferFieldErrors.username && (
              <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                {transferFieldErrors.username}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Tokens to Transfer</label>
            <input 
              type="number" 
              name="tokens" 
              placeholder="Enter amount" 
              value={transferForm.tokens || ''} 
              onChange={handleTransferChange}
              onBlur={(e) => {
                const validation = validateTokens(Number(e.target.value));
                setTransferFieldErrors(prev => ({ ...prev, tokens: validation.error }));
              }}
              min="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: transferFieldErrors.tokens ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: `2px solid ${transferFieldErrors.tokens ? '#ff4c4c' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {transferFieldErrors.tokens && (
              <div style={{ color: '#f99', fontSize: '0.85rem', marginTop: '4px', paddingLeft: '4px' }}>
                {transferFieldErrors.tokens}
              </div>
            )}
          </div>
          {transferForm.tokens > 0 && (
            <div style={{ marginBottom: '20px', padding: '12px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
              <div style={{ fontSize: '12px', color: '#856404', marginBottom: '4px' }}>Available Tokens</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#856404' }}>
                {wallet.tokensAvailable} tokens available
              </div>
              {transferForm.tokens > wallet.tokensAvailable && (
                <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '8px' }}>
                  ⚠️ Insufficient tokens available
                </div>
              )}
            </div>
          )}
          <button onClick={handleTransferTokens}>Confirm Transfer</button>
        </Modal>
      )}

      {/* Success Modal */}
      {successModal.open && (
        <SuccessModal
          message={successModal.message}
          onClose={() => setSuccessModal({ open: false, message: "" })}
          autoCloseDelay={4000}
        />
      )}

      {/* View Offered Item Modal */}
      {viewingItem && (
        <div className="modal-backdrop" onClick={handleCloseItemView}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Offered Item Details</h2>
              <button className="modal-close-btn" onClick={handleCloseItemView} aria-label="Close modal">×</button>
            </div>
            <div className="modal-body">
              {loadingItem ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#ffffff' }}>
                  Loading item details...
                </div>
              ) : viewingItemDetails ? (
                <div style={{ color: '#ffffff' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '24px' }}>{viewingItemDetails.title || 'Untitled Item'}</h3>
                    {viewingItemDetails.images && viewingItemDetails.images.length > 0 ? (
                      <div>
                        <img
                          src={viewingItemDetails.images[0]}
                          alt={viewingItemDetails.title}
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23555555' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        {viewingItemDetails.images.length > 1 && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {viewingItemDetails.images.slice(1).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${viewingItemDetails.title} ${idx + 2}`}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  // Swap images
                                  const newImages = [img, ...viewingItemDetails.images.filter(i => i !== img)];
                                  setViewingItemDetails({ ...viewingItemDetails, images: newImages });
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '300px',
                        background: '#555555',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        color: '#ffffff',
                        marginBottom: '20px'
                      }}>
                        No images available
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <strong>Description:</strong>
                      <p style={{ marginTop: '4px', color: '#cccccc' }}>{viewingItemDetails.description || "—"}</p>
                    </div>
                    <div>
                      <strong>Category:</strong>
                      <p style={{ marginTop: '4px', color: '#cccccc' }}>{viewingItemDetails.category || "—"}</p>
                    </div>
                    <div>
                      <strong>Condition:</strong>
                      <p style={{ marginTop: '4px', color: '#cccccc' }}>{viewingItemDetails.condition || viewingItemDetails.itemCondition || "—"}</p>
                    </div>
                    {viewingItemDetails.priority !== undefined && (
                      <div>
                        <strong>Priority:</strong>
                        <p style={{ marginTop: '4px', color: '#cccccc' }}>{viewingItemDetails.priority || 0}</p>
                      </div>
                    )}
                    {viewingItemDetails.user && (
                      <div>
                        <strong>Owner:</strong>
                        <p style={{ marginTop: '4px', color: '#cccccc' }}>{viewingItemDetails.user.username || viewingItemDetails.username || "—"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#ffffff' }}>
                  Failed to load item details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
