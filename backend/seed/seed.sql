-- Fictitious demo data. Reference date for the demo: 2026-10-24.
-- Conforms strictly to seed-data.json

-- Clear previous data
DELETE FROM ticket_updates;
DELETE FROM policies;
DELETE FROM tickets;

-- Insert Seed Policies
INSERT INTO policies (id, policy_code, title, category, policy_text, applicable_conditions) VALUES
(
  'POL-REFUND-01',
  'POL-REFUND-01',
  'Refund Policy',
  'Refund',
  'Customers may request a full refund within 14 days of the purchase date for physical items that are unused and in original packaging. A refund request must include the order number and the purchase date. Requests made after 14 days are not eligible for a refund; the agent may offer store credit of 50% of the item price instead. Digital products are not refundable once downloaded.',
  'Order number and purchase date required. Physical items must be unused and in original packaging within 14 days of purchase date for full refund. Over 14 days offers 50% store credit.'
),
(
  'POL-DELIVERY-01',
  'POL-DELIVERY-01',
  'Delivery Delay Policy',
  'Delivery',
  'Standard delivery takes 3 to 5 business days after the shipping date. If an order has not arrived 7 business days after shipping, support opens a carrier investigation and sets the ticket to In Progress. If the order has not arrived 10 business days after shipping, the customer may choose a free re-shipment or a full refund. The order number and shipping date are required to apply this policy.',
  'Order number and shipping date required. 7 business days without arrival triggers carrier investigation and In Progress status. 10 business days without arrival offers choice of free re-shipment or full refund.'
),
(
  'POL-ACCOUNT-01',
  'POL-ACCOUNT-01',
  'Account Access Policy',
  'Account',
  'After 5 failed login attempts an account is locked for 30 minutes. Customers can unlock it sooner by requesting a password reset link sent only to the registered email address. Support staff must never ask for or accept a customer''s password. If the customer cannot access the registered email, the ticket must be escalated to the Security team for identity verification.',
  'Locked after 5 failed attempts for 30 minutes. Unlock sooner via password reset link sent only to registered email. Never ask/accept password. Escalate to Security if registered email is inaccessible.'
);

-- Insert Seed Tickets
INSERT INTO tickets (id, customer_name, customer_email, subject, description, category, status, order_id, purchase_date, shipping_date, note) VALUES
(
  'T-001',
  'Abel Tesfaye',
  'abel@example.com',
  'Refund for wireless headphones',
  'I bought wireless headphones (order ORD-1001) on 2026-10-20 but they do not fit me. They are unopened. I would like a refund.',
  'Refund',
  'Open',
  'ORD-1001',
  '2026-10-20',
  NULL,
  'Ordinary case: complete refund request, within 14 days.'
),
(
  'T-002',
  'Selam Bekele',
  'selam@example.com',
  'Want my money back for blender',
  'The blender I ordered (order ORD-1002) stopped working and I want a refund. Please help.',
  'Refund',
  'Open',
  'ORD-1002',
  NULL,
  NULL,
  'Ambiguous/incomplete case: purchase date missing, agent must ask for it.'
),
(
  'T-003',
  'Dawit Alemu',
  'dawit@example.com',
  'Order has not arrived',
  'My order ORD-1003 was shipped on 2026-10-08 and still has not arrived. It has been over two weeks. What can you do?',
  'Delivery',
  'Open',
  'ORD-1003',
  '2026-10-07',
  '2026-10-08',
  'Ordinary case: delivery delay beyond 10 business days (re-ship or refund).'
),
(
  'T-004',
  'Hana Girma',
  'hana@example.com',
  'Locked out of my account',
  'I tried to log in several times and now my account says it is locked. I still have access to my registered email.',
  'Account',
  'Open',
  NULL,
  NULL,
  NULL,
  'Ordinary case: account lockout, password reset link to registered email.'
),
(
  'T-005',
  'Yonas Haile',
  'yonas@example.com',
  'Price match request',
  'I saw the same keyboard (order ORD-1005) cheaper at another shop. Can you match their price and refund the difference?',
  'Other',
  'Open',
  'ORD-1005',
  '2026-10-18',
  NULL,
  'Out-of-policy case: no policy covers price matching, agent must say so and escalate.'
);
