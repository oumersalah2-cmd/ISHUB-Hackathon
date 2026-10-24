-- Synthetic Demo Dataset for AI Customer Support Resolution Agent
-- All names, emails, and scenarios are completely fictitious.

-- Clear previous data
DELETE FROM ticket_updates;
DELETE FROM policies;
DELETE FROM tickets;

-- Insert Synthetic Policies
INSERT INTO policies (id, policy_code, title, category, policy_text, applicable_conditions) VALUES
(
  'POL-REF-01',
  'POL-REF-01',
  'Standard 30-Day Return & Full Refund Policy',
  'Refund',
  'Customers are entitled to a full refund or direct exchange on retail items if requested within 30 calendar days of the verified purchase date. The customer must specify the purchase date and return the item in good physical condition with original packaging. For defective or faulty merchandise reported within this 30-day window, a full refund including prepaid return shipping is issued immediately upon receipt.',
  'Purchase date must be verified; request must be made within 30 days of purchase; customer must retain valid order details.'
),
(
  'POL-DEL-01',
  'POL-DEL-01',
  'Courier Shipment Delay & Lost Package Policy',
  'Delivery',
  'When a standard or express delivery package experiences no carrier transit updates or tracking movement for five (5) or more business days, support officers are authorized to declare the shipment delayed in transit. Support officers should offer the customer an immediate priority replacement shipment at no extra charge or a full refund if the customer prefers cancellation.',
  'Tracking scan stalled for 5+ business days; shipping address verified; package not marked as delivered by courier.'
),
(
  'POL-REFUND-01',
  'POL-REFUND-01',
  'Standard 30-Day Return & Full Refund Policy',
  'Refund',
  'Customers are entitled to a full refund or direct exchange on retail items if requested within 30 calendar days of the verified purchase date. The customer must specify the purchase date and return the item in good physical condition with original packaging. For defective or faulty merchandise reported within this 30-day window, a full refund including prepaid return shipping is issued immediately upon receipt.',
  'Purchase date must be verified; request must be made within 30 days of purchase; customer must retain valid order details.'
),
(
  'POL-DELIVERY-01',
  'POL-DELIVERY-01',
  'Courier Shipment Delay & Lost Package Policy',
  'Delivery',
  'When a standard or express delivery package experiences no carrier transit updates or tracking movement for five (5) or more business days, support officers are authorized to declare the shipment delayed in transit. Support officers should offer the customer an immediate priority replacement shipment at no extra charge or a full refund if the customer prefers cancellation.',
  'Tracking scan stalled for 5+ business days; shipping address verified; package not marked as delivered by courier.'
),
(
  'POL-ACCOUNT-01',
  'POL-ACCOUNT-01',
  'Account Lockout & Secure Password Recovery Policy',
  'Account',
  'If a customer account is locked due to repeated incorrect password attempts or failing to receive SMS two-factor authentication codes, support officers must confirm the primary email registered to the account and issue an encrypted, time-limited one-time password (OTP) password reset link. Support officers are strictly prohibited from setting or requesting customer passwords in plain text. If customer cannot reach their registered email, escalate ticket.',
  'Customer account locked; customer email address on ticket matches internal registered profile; 2FA delivery failed.'
),
(
  'POL-ACC-01',
  'POL-ACC-01',
  'Account Lockout & Secure Password Recovery Policy',
  'Account',
  'If a customer account is locked due to repeated incorrect password attempts or failing to receive SMS two-factor authentication codes, support officers must confirm the primary email registered to the account and issue an encrypted, time-limited one-time password (OTP) password reset link. Support officers are strictly prohibited from setting or requesting customer passwords in plain text. If customer cannot reach their registered email, escalate ticket.',
  'Customer account locked; customer email address on ticket matches internal registered profile; 2FA delivery failed.'
),
(
  'POL-DMG-01',
  'POL-DMG-01',
  'Damaged or Incorrect Product Dispatch Policy',
  'Refund',
  'Customers who receive a damaged item or an incorrect product that does not match the order manifest must notify customer support within fourteen (14) calendar days of delivery. Upon confirming the error, the support team will immediately dispatch the correct replacement item with complimentary express delivery or issue a 100% refund without requiring return of low-value incorrect items.',
  'Reported within 14 calendar days of delivery; product mismatch or visible damage verified; valid order ID.'
);

-- Insert Synthetic Demo Tickets
INSERT INTO tickets (id, customer_name, customer_email, subject, description, category, status, purchase_date) VALUES
(
  'T-1001',
  'Liam Walker',
  'liam.walker.fake@example.com',
  'Return request for SoundPro Wireless Headphones',
  'Hi support team, I purchased your SoundPro Wireless Noise-Cancelling Headphones recently, but they fit too tightly on my head. I would like to return them for a full refund back to my Visa card please. Let me know the procedure.',
  'Refund',
  'Open',
  NULL -- Intentionally NULL to trigger missing-information clarification workflow
),
(
  'T-1002',
  'Sophia Martinez',
  'sophia.martinez.fake@example.com',
  'Defective Barista Supreme Espresso Machine',
  'Hello, I purchased the Barista Supreme Espresso Machine on 2026-10-12 (Order #ORD-7712). Yesterday morning the steam boiler completely stopped heating up and emits a clicking noise. The purchase was made only 12 days ago, which is well within your 30-day return policy. I have all original packaging ready. Please process my refund.',
  'Refund',
  'Open',
  '2026-10-12' -- Complete details, within 30 days
),
(
  'T-1003',
  'Marcus Chen',
  'marcus.chen.fake@example.com',
  'Express courier shipment stalled for Ergonomic Mesh Chair',
  'I placed an order for the Ergonomic Mesh Chair with 2-day express delivery (Tracking: EXP-99210-FAKE). The courier status has been completely stuck at the regional distribution center for 6 business days with zero movement. I need this chair for my home office immediately. Please either send a replacement right away or refund my order.',
  'Delivery',
  'Open',
  '2026-10-14'
),
(
  'T-1004',
  'Amara Diallo',
  'amara.diallo.fake@example.com',
  'Account locked out after password reset attempts',
  'My account is currently locked out after I typed an old password three times. When I tried using the "Forgot Password" link on the website, the SMS verification code was never sent to my phone. I need to access my recent invoices urgently. Can you send a secure reset link to my registered email?',
  'Account Access',
  'Open',
  NULL
),
(
  'T-1005',
  'Elena Rostova',
  'elena.rostova.fake@example.com',
  'Commercial enterprise software SLA and escrow customization',
  'Our enterprise legal department requires a customized source code escrow agreement and 99.999% bespoke financial uptime warranty before our 10 team member licenses can be renewed. None of the standard web terms address enterprise source code escrow.',
  'Other',
  'Open',
  '2026-10-01' -- Uncovered by standard consumer policies; must lead to Escalated recommendation
),
(
  'T-1006',
  'Devon Reed',
  'devon.reed.fake@example.com',
  'Incorrect package received - USB hub delivered instead of Mechanical Keyboard',
  'I received my shipment today for order #ORD-44910. I opened the sealed cardboard box expecting the Apex Pro RGB Mechanical Keyboard, but inside was a small 4-port USB hub. The delivery was made yesterday. Please expedite the correct keyboard to me.',
  'Refund',
  'Open',
  '2026-10-22'
);
