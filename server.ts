import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para ler JSON no body das requisições (necessário para o Webhook)
  app.use(express.json());

  // ============================================================================
  // API ROUTES (BACKEND)
  // ============================================================================
  
  // Rota de Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Rota do Webhook do Mercado Pago
  app.post("/api/webhook/mercadopago", async (req, res) => {
    try {
      console.log("🔔 [WEBHOOK] Recebido do Mercado Pago:", req.body);
      
      // O Mercado Pago envia o ID do pagamento ou da assinatura aqui.
      // A lógica completa será:
      // 1. Pegar o ID do pagamento no req.body
      // 2. Consultar a API do Mercado Pago para ver se o status é "approved"
      // 3. Pegar o email ou ID do usuário atrelado a esse pagamento
      // 4. Atualizar o Firebase: db.collection('barbershops').doc(userId).update({ subscriptionStatus: 'active' })
      
      // Como precisamos das chaves do Firebase Admin e do Mercado Pago, 
      // esta rota está preparada para receber o aviso.
      
      res.sendStatus(200); // Sempre retorne 200 para o Mercado Pago parar de enviar o aviso
    } catch (error) {
      console.error("Erro no Webhook:", error);
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
