import React, { useEffect, useState } from "react";
import "../styles/UserWalletPage.css";
import axios from "../api/axios";
import Modal from "../components/Modal";
import ItemTabs from "../components/ItemTabs";
import { useAuth } from "../context/AuthContext";

export default function UserWalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    availableTokens: 0,
    lockedTokens: 0,
    spentTokens: 0
  });

  const [swapUsage, setSwapUsage] = useState([]);
  const [featureUsage, setFeatureUsage] = useState([]);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    tokens: 0
  });

  const [transferForm, setTransferForm] = useState({
    username: "",
    tokens: 0
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
        console.error(err);
        alert("Failed to load wallet data");
      }
    };

    fetchData();
  }, [user]);

  // Handlers
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBuyTokens = async () => {
    try {
      await axios.put("/wallet/buy", {
        user: { username: user.username },
        amountPaid: paymentForm.tokens / 5, // 1 USD = 5 tokens
        tokensPurchased: Number(paymentForm.tokens),
      });

      // Refresh wallet
      const walletRes = await axios.get(`/wallet/${user.username}`);
      setWallet(walletRes.data);
      setBuyModalOpen(false);
      setPaymentForm({ cardholderName: "", cardNumber: "", expirationDate: "", securityCode: "", tokens: 0 });
    } catch (err) {
      console.error(err);
      alert("Failed to buy tokens");
    }
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTransferTokens = async () => {
    try {
      await axios.put(`/wallet/transfer/${user.username}`, { 
        username: transferForm.username,
        tokens: transferForm.tokens 
      });
      // Refresh wallet
      const walletRes = await axios.get(`/wallet/${user.username}`);
      setWallet(walletRes.data);
      setTransferModalOpen(false);
      setTransferForm({ username: "", tokens: 0 });
    } catch (err) {
      console.error(err);
      alert("Failed to transfer tokens");
    }
  };

  return (
    <div className="wallet-page-root">
      <h2>User Wallet</h2>

      <div className="wallet-overview">
        <div className="wallet-card">
          <div>Available Tokens</div>
          <div className="wallet-value">{wallet.availableTokens}</div>
        </div>
        <div className="wallet-card">
          <div>Locked Tokens</div>
          <div className="wallet-value">{wallet.lockedTokens}</div>
        </div>
        <div className="wallet-card">
          <div>Spent Tokens</div>
          <div className="wallet-value">{wallet.spentTokens}</div>
        </div>
      </div>

      <div className="wallet-actions">
        <button onClick={() => setBuyModalOpen(true)}>Buy Tokens</button>
        <button onClick={() => setTransferModalOpen(true)}>Transfer Tokens</button>
      </div>

      {/* Tabs */}
      <ItemTabs
        offeredLabel="Swap Usage"
        wantedLabel="Feature Usage"
        offeredCount={swapUsage.length}
        wantedCount={featureUsage.length}
        renderContent={(activeTab) => {
          if (activeTab === "offered") return (
            <div className="items-list">
              {swapUsage.map(s => (
                <div key={s.id} className="usage-card">
                  <strong>Swap ID:</strong> {s.swapId} <br/>
                  <strong>Tokens Used:</strong> {s.tokensUsed} <br/>
                  <strong>Purpose:</strong> {s.purpose || "—"} <br/>
                  <strong>Created:</strong> {new Date(s.createdAt).toLocaleString()}
                </div>
              ))}
            </div>
          );
          if (activeTab === "wanted") return (
            <div className="items-list">
              {featureUsage.map(f => (
                <div key={f.id} className="usage-card">
                  <strong>Feature:</strong> {f.featureName} <br/>
                  <strong>Tokens Used:</strong> {f.tokensUsed} <br/>
                  <strong>Created:</strong> {new Date(f.createdAt).toLocaleString()}
                </div>
              ))}
            </div>
          );
        }}
      />

      {/* Buy Tokens Modal */}
      {buyModalOpen && (
        <Modal onClose={() => setBuyModalOpen(false)} title="Buy Tokens">
          <input type="text" name="cardholderName" placeholder="Cardholder Name" value={paymentForm.cardholderName} onChange={handlePaymentChange} />
          <input type="text" name="cardNumber" placeholder="Card Number" value={paymentForm.cardNumber} onChange={handlePaymentChange} />
          <input type="text" name="expirationDate" placeholder="Expiration Date (MM/YY)" value={paymentForm.expirationDate} onChange={handlePaymentChange} />
          <input type="text" name="securityCode" placeholder="Security Code (CVV)" value={paymentForm.securityCode} onChange={handlePaymentChange} />
          <input type="number" name="tokens" placeholder="Tokens to Buy" value={paymentForm.tokens} onChange={handlePaymentChange} />
          <input type="text" placeholder="Amount in USD" value={(paymentForm.tokens / 5).toFixed(2)} disabled />
          <button onClick={handleBuyTokens}>Confirm Payment</button>
        </Modal>
      )}

      {/* Transfer Tokens Modal */}
      {transferModalOpen && (
        <Modal onClose={() => setTransferModalOpen(false)} title="Transfer Tokens">
          <input type="text" name="username" placeholder="Recipient Username" value={transferForm.username} onChange={handleTransferChange} />
          <input type="number" name="tokens" placeholder="Tokens to Transfer" value={transferForm.tokens} onChange={handleTransferChange} />
          <button onClick={handleTransferTokens}>Confirm Transfer</button>
        </Modal>
      )}
    </div>
  );
}
