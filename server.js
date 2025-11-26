const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'taji-signing-service',
    timestamp: new Date().toISOString()
  });
});

// Sign transaction endpoint
app.post('/sign-transaction', async (req, res) => {
  try {
    const {
      transaction,
      privateKey
    } = req.body;

    // Validate required fields
    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction object is required'
      });
    }

    if (!privateKey) {
      return res.status(400).json({
        success: false,
        message: 'Private key is required'
      });
    }

    // Validate transaction fields
    const requiredFields = ['nonce', 'gasPrice', 'gas', 'to', 'value', 'data', 'chainId'];
    const missingFields = requiredFields.filter(field => !transaction[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required transaction fields: ${missingFields.join(', ')}`
      });
    }

    console.log('📝 [SIGNING] Received transaction signing request');
    console.log('📝 [SIGNING] Transaction:', {
      nonce: transaction.nonce,
      gasPrice: transaction.gasPrice,
      gas: transaction.gas,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data ? transaction.data.substring(0, 20) + '...' : 'N/A',
      chainId: transaction.chainId
    });

    // Create wallet from private key
    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey);
      console.log('✅ [SIGNING] Wallet created from private key');
    } catch (error) {
      console.error('❌ [SIGNING] Failed to create wallet:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid private key format'
      });
    }

    // Convert hex strings to BigNumber where needed
    // ethers.js v6 handles hex strings directly, but we need to ensure proper format
    const txRequest = {
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      gasLimit: transaction.gas,
      gasPrice: transaction.gasPrice,
      nonce: transaction.nonce,
      chainId: transaction.chainId
    };

    console.log('📝 [SIGNING] Transaction request prepared:', {
      to: txRequest.to,
      value: txRequest.value,
      data: txRequest.data ? txRequest.data.substring(0, 20) + '...' : 'N/A',
      gasLimit: txRequest.gasLimit,
      gasPrice: txRequest.gasPrice,
      nonce: txRequest.nonce,
      chainId: txRequest.chainId
    });

    // Sign the transaction
    let signedTx;
    try {
      signedTx = await wallet.signTransaction(txRequest);
      console.log('✅ [SIGNING] Transaction signed successfully');
      console.log('✅ [SIGNING] Signed transaction hex length:', signedTx.length);
    } catch (error) {
      console.error('❌ [SIGNING] Failed to sign transaction:', error.message);
      console.error('❌ [SIGNING] Error details:', error);
      return res.status(500).json({
        success: false,
        message: `Transaction signing failed: ${error.message}`
      });
    }

    // Return signed transaction
    res.json({
      success: true,
      signedTransaction: signedTx,
      message: 'Transaction signed successfully'
    });

  } catch (error) {
    console.error('❌ [SIGNING] Unexpected error:', error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ [ERROR] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 [SERVER] Taji Signing Service running on port ${PORT}`);
  console.log(`🚀 [SERVER] Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 [SERVER] Sign endpoint: http://localhost:${PORT}/sign-transaction`);
});

