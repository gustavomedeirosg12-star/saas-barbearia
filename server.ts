import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

// Ler config do Firebase do ambiente atual
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const MP_ACCESS_TOKEN = "APP_USR-146883498266239-040801-f16b98b039ca4ffd0c3a529149f32e63-483253652";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ============================================================================
  // AUTENTICAÇÃO DO SERVIDOR (MÁGICA PARA NÃO PRECISAR DO ADMIN SDK)
  // ============================================================================
  const email = 'webhook@barbersaas.com';
  const password = 'WebhookSuperSecretPassword123!';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Servidor autenticado no Firebase com sucesso!');
  } catch (error: any) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuário do servidor criado e autenticado com sucesso!');
    } catch (createError) {
      console.error('❌ Erro ao autenticar servidor no Firebase:', createError);
    }
  }

  // ============================================================================
  // API ROUTES (BACKEND)
  // ============================================================================
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Rota do Webhook do Mercado Pago
  app.post("/api/webhook/mercadopago", async (req, res) => {
    try {
      const { type, data, action } = req.body;
      console.log("🔔 [WEBHOOK] Recebido do Mercado Pago:", type || action, data?.id);
      
      // O Mercado Pago envia 'payment' ou 'subscription_preapproval'
      if (type === 'payment' || req.body.topic === 'payment' || action?.startsWith('payment')) {
        const paymentId = data?.id || req.query.id;
        
        if (!paymentId) {
          return res.sendStatus(200);
        }

        // 1. Consultar a API do Mercado Pago para pegar os detalhes do pagamento
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
        });
        
        const paymentData = await response.json();
        
        // 2. Verificar se está aprovado e se tem a referência do usuário
        if (paymentData.status === 'approved' && paymentData.external_reference) {
          const userId = paymentData.external_reference;
          console.log(`💰 Pagamento APROVADO! Liberando acesso para o usuário: ${userId}`);
          
          // 3. Atualizar o Firebase (O servidor tem permissão especial nas regras)
          await updateDoc(doc(db, 'barbershops', userId), { 
            subscriptionStatus: 'active' 
          });
          
          console.log(`✅ Acesso liberado com sucesso para ${userId}`);
        } else {
          console.log(`⏳ Pagamento ${paymentId} ainda não aprovado ou sem referência.`);
        }
      }
      
      res.sendStatus(200); 
    } catch (error) {
      console.error("❌ Erro no Webhook:", error);
      res.sendStatus(500);
    }
  });

  // ============================================================================
  // VITE MIDDLEWARE (FRONTEND)
  // ============================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Webhook pronto em: http://localhost:${PORT}/api/webhook/mercadopago`);
  });
}

startServer();
