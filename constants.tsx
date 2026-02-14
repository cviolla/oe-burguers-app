
import { Product, Coupon } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'OE Burguer',
    description: 'O clássico da casa com carne black angus 180g e queijo artesanal.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    category: 'Burgers',
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Combo 1 com guaracrac',
    description: 'Burguer Triplo + Batata M + Guaracrac.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=60',
    category: 'Combos',
    isPopular: true
  },
  {
    id: '3',
    name: 'Batata-frita Grande',
    description: 'Porção generosa de batatas crocantes.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1573016608964-b49e87dcac09?w=500&auto=format&fit=crop&q=60',
    category: 'Batata-frita'
  },
  {
    id: '4',
    name: 'Banoffe',
    description: 'Camadas de biscoito, doce de leite, banana e chantilly.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60',
    category: 'Sobremesas'
  }
];

export const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', code: 'PRIMEIRACOMPRA', description: '10% OFF no seu primeiro pedido no app', discount: '10%', type: 'percentage' },
  { id: 'c2', code: 'ENTREGAGRATIS', description: 'Válido para pedidos acima de R$50', discount: 'Grátis', type: 'shipping' },
  { id: 'c3', code: 'QUEROBURGER', description: 'Desconto em qualquer combo da linha OE', discount: 'R$15', type: 'fixed' }
];

export const PRODUCT_ADDONS = [
  { id: 'carne', label: 'Carne', price: 3.00 },
  { id: 'carne_picanha', label: 'Carne de Picanha', price: 4.00 },
  { id: 'ovo', label: 'Ovo', price: 3.00 },
  { id: 'bacon', label: 'Bacon', price: 2.00 },
  { id: 'queijo', label: 'Queijo', price: 2.00 },
  { id: 'presunto', label: 'Presunto', price: 2.00 },
  { id: 'file_frango', label: 'Filé de Frango', price: 3.00 },
  { id: 'calabresa', label: 'Calabresa', price: 2.00 },
];
