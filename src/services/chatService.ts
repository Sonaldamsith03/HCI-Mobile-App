import { Message, PriceOffer, ConversationThread, Produce } from '../types';

type MessageListener = (messages: Message[]) => void;
type ThreadListener = (threads: ConversationThread[]) => void;

/**
 * Real-Time Chat Service
 * Supports real-time subscriptions, message broadcasting, interactive bargaining,
 * and automated responsive negotiation handling.
 */
class RealtimeChatService {
  private messageListeners: Map<string, Set<MessageListener>> = new Map();
  private threadListeners: Set<ThreadListener> = new Set();
  private messagesByConversation: Map<string, Message[]> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Seed initial conversation
    const defaultThreadId = 'Mateo Gutierrez_Elena Vance_1';
    const initialMsgs: Message[] = [
      {
        id: 1,
        conversationId: defaultThreadId,
        farmerName: 'Mateo Gutierrez',
        buyerName: 'Elena Vance',
        produceName: 'Organic Roma Tomatoes',
        produceId: 1,
        sender: 'Buyer',
        content: 'Hi Mateo, are these vine-ripened tomatoes harvested this morning?',
        timestamp: Date.now() - 3600000 * 2,
        status: 'read',
      },
      {
        id: 2,
        conversationId: defaultThreadId,
        farmerName: 'Mateo Gutierrez',
        buyerName: 'Elena Vance',
        produceName: 'Organic Roma Tomatoes',
        produceId: 1,
        sender: 'Farmer',
        content: 'Yes Elena! We hand-picked them at 6:00 AM from the greenhouse. They are fresh and firm.',
        timestamp: Date.now() - 3600000 * 1.5,
        status: 'read',
      },
      {
        id: 3,
        conversationId: defaultThreadId,
        farmerName: 'Mateo Gutierrez',
        buyerName: 'Elena Vance',
        produceName: 'Organic Roma Tomatoes',
        produceId: 1,
        sender: 'Buyer',
        content: 'Can you pack them in ventilated wooden crates?',
        timestamp: Date.now() - 3600000,
        status: 'read',
      },
      {
        id: 4,
        conversationId: defaultThreadId,
        farmerName: 'Mateo Gutierrez',
        buyerName: 'Elena Vance',
        produceName: 'Organic Roma Tomatoes',
        produceId: 1,
        sender: 'Farmer',
        content: 'Absolutely. We will crate and label them for immediate dispatch with our temperature-controlled courier.',
        timestamp: Date.now() - 1800000,
        status: 'read',
      },
    ];
    this.messagesByConversation.set(defaultThreadId, initialMsgs);
  }

  public getConversationId(farmerName: string, buyerName: string, produceId?: number): string {
    const f = farmerName.trim().toLowerCase();
    const b = buyerName.trim().toLowerCase();
    const p = produceId || 0;

    // Check if an existing conversation matches these participants
    for (const key of this.messagesByConversation.keys()) {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const kf = parts[0].trim().toLowerCase();
        const kb = parts[1].trim().toLowerCase();
        const kp = parseInt(parts[2], 10) || 0;
        if (kf === f && (kb === b || parts[1] === 'Elena Vance' || parts[1] === 'Buyer') && (p === 0 || kp === p || kp === 0)) {
          return key;
        }
      }
    }

    return `${farmerName.trim()}_${buyerName.trim()}_${produceId || 0}`;
  }

  /**
   * Subscribes to real-time updates for a specific conversation channel
   */
  public subscribeToConversation(conversationId: string, listener: MessageListener): () => void {
    if (!this.messageListeners.has(conversationId)) {
      this.messageListeners.set(conversationId, new Set());
    }
    this.messageListeners.get(conversationId)!.add(listener);

    // Emit initial messages sorted chronologically (oldest first to newest at bottom)
    const current = (this.messagesByConversation.get(conversationId) || []).slice().sort((a, b) => a.timestamp - b.timestamp);
    listener([...current]);

    return () => {
      this.messageListeners.get(conversationId)?.delete(listener);
    };
  }

  /**
   * Subscribes to conversation threads list (Inbox view)
   */
  public subscribeToThreads(listener: ThreadListener): () => void {
    this.threadListeners.add(listener);
    listener(this.getAllThreads());

    return () => {
      this.threadListeners.delete(listener);
    };
  }

  public getAllThreads(): ConversationThread[] {
    const threads: ConversationThread[] = [];
    this.messagesByConversation.forEach((msgs, convId) => {
      if (msgs.length === 0) return;
      const last = msgs[msgs.length - 1];
      const activeOffer = [...msgs].reverse().find(m => m.offer)?.offer;
      
      threads.push({
        id: convId,
        farmerName: last.farmerName,
        buyerName: last.buyerName || 'Buyer',
        produceId: last.produceId,
        produceName: last.produceName,
        lastMessage: last.offer 
          ? `Offer: $${last.offer.offeredPrice.toFixed(2)} (${last.offer.status.toUpperCase()})` 
          : last.content,
        lastTimestamp: last.timestamp,
        unreadCount: msgs.filter(m => m.status !== 'read' && m.sender === 'Farmer').length,
        activeOffer,
      });
    });

    return threads.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }

  /**
   * Broadcasts a live message into the conversation
   */
  public sendMessage(
    conversationId: string,
    farmerName: string,
    buyerName: string,
    produceName: string,
    content: string,
    sender: 'Buyer' | 'Farmer',
    produceId?: number,
    offer?: PriceOffer
  ): Message {
    const list = this.messagesByConversation.get(conversationId) || [];
    const newMsg: Message = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      conversationId,
      farmerName,
      buyerName,
      produceName,
      produceId,
      sender,
      content,
      timestamp: Date.now(),
      offer,
      status: 'sent',
    };

    list.push(newMsg);
    this.messagesByConversation.set(conversationId, list);

    // Notify channel listeners
    this.notifyConversation(conversationId);
    this.notifyThreads();

    // Mark as delivered
    setTimeout(() => {
      newMsg.status = 'delivered';
      this.notifyConversation(conversationId);
    }, 400);

    // Simulate Farmer interactive reply when a Buyer messages or negotiates in demo mode
    if (sender === 'Buyer') {
      this.scheduleFarmerAutoResponse(conversationId, farmerName, buyerName, produceName, content, offer, produceId);
    }

    return newMsg;
  }

  /**
   * Responds to an active offer (Accept, Decline, Counter)
   */
  public respondToOffer(
    conversationId: string,
    messageId: number,
    action: 'accept' | 'decline' | 'counter',
    counterPrice?: number,
    responder: 'Farmer' | 'Buyer' = 'Farmer'
  ) {
    const list = this.messagesByConversation.get(conversationId);
    if (!list) return;

    const targetMsg = list.find(m => m.id === messageId);
    if (!targetMsg || !targetMsg.offer) return;

    let updatedStatus: import('../types').OfferStatus = 'pending';
    let responseText = '';

    if (action === 'accept') {
      updatedStatus = 'accepted';
      responseText = `Deal accepted! Price locked at $${targetMsg.offer.offeredPrice.toFixed(2)}/${targetMsg.offer.unit} for ${targetMsg.offer.quantity} ${targetMsg.offer.unit}. Escrow guarantees freshness upon arrival.`;
    } else if (action === 'decline') {
      updatedStatus = 'declined';
      responseText = `I cannot fulfill this at $${targetMsg.offer.offeredPrice.toFixed(2)}/${targetMsg.offer.unit}. Our certified organic standard requires minimum $${targetMsg.offer.originalPrice.toFixed(2)}.`;
    } else if (action === 'counter' && counterPrice) {
      updatedStatus = 'countered';
      responseText = `How about a counter-offer of $${counterPrice.toFixed(2)}/${targetMsg.offer.unit}? If that works, let's seal the order!`;
    }

    targetMsg.offer = {
      ...targetMsg.offer,
      status: updatedStatus,
      counterPrice: counterPrice || targetMsg.offer.counterPrice,
    };

    // Add conversational confirmation bubble
    this.sendMessage(
      conversationId,
      targetMsg.farmerName,
      targetMsg.buyerName || 'Buyer',
      targetMsg.produceName,
      responseText,
      responder,
      targetMsg.produceId
    );
  }

  private scheduleFarmerAutoResponse(
    conversationId: string,
    farmerName: string,
    buyerName: string,
    produceName: string,
    content: string,
    offer?: PriceOffer,
    produceId?: number
  ) {
    setTimeout(() => {
      const list = this.messagesByConversation.get(conversationId);
      if (!list) return;

      if (offer) {
        // Smart bargaining logic
        const discount = ((offer.originalPrice - offer.offeredPrice) / offer.originalPrice);
        if (discount <= 0.15) {
          // Reasonably discounted (<15%) -> Accept
          this.respondToOffer(conversationId, list[list.length - 1].id, 'accept', undefined, 'Farmer');
        } else if (discount <= 0.30) {
          // Moderate discount -> Propose middle ground counter-offer
          const counter = Number((offer.originalPrice * 0.90).toFixed(2));
          this.respondToOffer(conversationId, list[list.length - 1].id, 'counter', counter, 'Farmer');
        } else {
          // Too deep discount -> Decline politely
          this.respondToOffer(conversationId, list[list.length - 1].id, 'decline', undefined, 'Farmer');
        }
      } else {
        // Text message reply
        let reply = "Thanks for checking in! Our farm trucks depart twice daily. Can arrange prompt pickup or doorstep delivery.";
        const lower = content.toLowerCase();
        if (lower.includes('morning') || lower.includes('fresh')) {
          reply = "Everything is harvested same-day between 5:30 AM and 7:00 AM for peak crispness!";
        } else if (lower.includes('price') || lower.includes('bulk') || lower.includes('discount')) {
          reply = "For bulk orders over 25 units, tap 'Make Offer' below and I can give you preferential farm-gate rates!";
        } else if (lower.includes('crate') || lower.includes('pack')) {
          reply = "We pack with shock-absorbing biodegradable straw and aerated crates to prevent transit bruising.";
        }

        this.sendMessage(conversationId, farmerName, buyerName, produceName, reply, 'Farmer', produceId);
      }
    }, 1200);
  }

  private notifyConversation(conversationId: string) {
    const list = (this.messagesByConversation.get(conversationId) || []).slice().sort((a, b) => a.timestamp - b.timestamp);
    const listeners = this.messageListeners.get(conversationId);
    if (listeners) {
      listeners.forEach(cb => cb([...list]));
    }
  }

  private notifyThreads() {
    const threads = this.getAllThreads();
    this.threadListeners.forEach(cb => cb(threads));
  }
}

export const chatService = new RealtimeChatService();
