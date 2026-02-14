
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { supabase } from '../supabase';
import { searchMatch } from '../utils';

interface EditorProps {
    onBack: () => void;
    products: Product[];
    onRefresh: () => void;
    deliveryFees: any[];
    addons?: any[];
    storeStatus?: 'auto' | 'open' | 'closed';
    onLogout?: () => void;
}

interface Category {
    id: string;
    name: string;
}

interface Order {
    id: string;
    short_id: string;
    client_name: string;
    client_phone: string;
    total_cents: number;
    status: 'pendente' | 'preparando' | 'pronto' | 'finalizado' | 'cancelado';
    payment_status: 'pendente' | 'pago';
    payment_method: string;
    delivery_address: string;
    neighborhood: string;
    observation?: string;

    is_pickup: boolean;
    created_at: string;
    order_items?: any[];
}

interface CustomerProfile {
    phone: string;
    name: string;
    is_archived: boolean;
    created_at?: string;
}

type AdminTab = 'pdv' | 'vendas' | 'cardapio' | 'cozinha' | 'logistica' | 'clientes';

const Editor: React.FC<EditorProps> = ({ onBack, products, onRefresh, deliveryFees, addons, storeStatus = 'auto', onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('pdv');
    const [orders, setOrders] = useState<Order[]>([]);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderTrash, setShowOrderTrash] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [itemSearch, setItemSearch] = useState('');
    const [newNeighborhood, setNewNeighborhood] = useState('');
    const [newFee, setNewFee] = useState('');

    const [showLogisticaTrash, setShowLogisticaTrash] = useState(false);
    const [editingFee, setEditingFee] = useState<any | null>(null);
    const [clientSearch, setClientSearch] = useState('');
    const [showArchivedClients, setShowArchivedClients] = useState(false);
    const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
    const [editingClient, setEditingClient] = useState<any | null>(null);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', phone: '' });
    const [menuSubTab, setMenuSubTab] = useState<'products' | 'addons'>('products');
    const [editingAddon, setEditingAddon] = useState<any | null>(null);
    const [timeRange, setTimeRange] = useState<'7' | '15' | '30' | '90' | 'all'>('all');

    const filteredOrdersRange = React.useMemo(() => {
        if (timeRange === 'all') return orders;

        const now = new Date();
        const days = parseInt(timeRange);
        const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

        return orders.filter(order => new Date(order.created_at) >= cutoff);
    }, [orders, timeRange]);

    const clients = React.useMemo(() => {
        const clientMap = new Map();
        const profileMap = new Map<string, CustomerProfile>((customerProfiles || []).map(p => [p.phone, p]));

        filteredOrdersRange.forEach(order => {
            const phone = (order.client_phone || 'sem-telefone').trim();
            const profile = profileMap.get(phone);

            const existing = clientMap.get(phone);
            if (!existing || new Date(order.created_at) > new Date(existing.last_order_at)) {
                clientMap.set(phone, {
                    name: profile?.name || order.client_name,
                    phone: order.client_phone,
                    total_orders: (existing?.total_orders || 0) + 1,
                    total_spent_cents: (existing?.total_spent_cents || 0) + order.total_cents,
                    last_order_at: order.created_at,
                    neighborhood: order.neighborhood,
                    address: order.delivery_address,
                    is_pickup_fan: order.is_pickup ? (existing?.is_pickup_fan || 0) + 1 : (existing?.is_pickup_fan || 0),
                    is_archived: profile?.is_archived || false
                });
            } else {
                existing.total_orders += 1;
                existing.total_spent_cents += order.total_cents;
                if (order.is_pickup) existing.is_pickup_fan += 1;
            }
        });

        let clientList = Array.from(clientMap.values());

        clientList = clientList.filter(c => c.is_archived === showArchivedClients);

        if (clientSearch) {
            const query = clientSearch;
            clientList = clientList.filter(c =>
                searchMatch(c.name || '', query) ||
                searchMatch(c.phone || '', query) ||
                searchMatch(c.neighborhood || '', query)
            );
        }

        return clientList.sort((a, b) => b.total_spent_cents - a.total_spent_cents);
    }, [orders, clientSearch, customerProfiles, showArchivedClients]);

    const handleAddDeliveryFee = async () => {
        if (!newNeighborhood || !newFee) return;
        setLoading(true);
        try {
            const feeCents = Math.round(Number(newFee.replace(/\D/g, "")));

            const { error } = await supabase
                .from('delivery_fees')
                .insert({
                    neighborhood: newNeighborhood,
                    fee_cents: feeCents,
                    is_active: true
                });

            if (error) throw error;

            setNewNeighborhood('');
            setNewFee('');
            onRefresh();
        } catch (error: any) {
            console.error('Erro ao adicionar taxa:', error);
            alert('Erro ao adicionar taxa: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeeActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('delivery_fees')
            .update({ is_active: !currentStatus })
            .eq('id', id);
        if (!error) onRefresh();
    };

    const handleUpdateDeliveryFee = async () => {
        if (!editingFee) return;
        setLoading(true);
        try {
            const feeCents = Math.round(Number(editingFee.displayFee.replace(/\D/g, "")));

            const { error } = await supabase
                .from('delivery_fees')
                .update({
                    neighborhood: editingFee.neighborhood,
                    fee_cents: feeCents
                })
                .eq('id', editingFee.id);

            if (error) throw error;

            setEditingFee(null);
            onRefresh();
        } catch (error: any) {
            console.error('Erro ao atualizar taxa:', error);
            alert('Erro ao atualizar taxa: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDeliveryFee = async (id: string) => {
        if (!confirm('Deseja excluir DEFINITIVAMENTE esta taxa de entrega?')) return;
        const { error } = await supabase
            .from('delivery_fees')
            .delete()
            .eq('id', id);
        if (!error) onRefresh();
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.loop = true;

        const handleInteraction = () => {
            setHasInteracted(true);
            window.removeEventListener('click', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!hasInteracted || !audioRef.current) return;

        const hasPendingOrders = orders.some(o => o.status === 'pendente');

        if (hasPendingOrders) {
            audioRef.current.play().catch(console.error);
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [orders, hasInteracted]);

    useEffect(() => {
        fetchCategories();
        fetchOrders();
        fetchCustomers();

        const channel = supabase
            .channel('admin_dashboard_v2')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
                fetchCustomers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchCustomers = async () => {
        const { data } = await supabase.from('customers').select('*');
        if (data) setCustomerProfiles(data);
    };



    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('id, name').order('sort_order', { ascending: true });
        if (data) setCategories(data);
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });
        if (!error && data) setOrders(data);
    };



    const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['payment_status']) => {
        const updates: any = { status };
        if (paymentStatus) updates.payment_status = paymentStatus;

        const { error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId);

        if (!error) fetchOrders();
    };

    const deleteOrderPermanently = async (orderId: string) => {
        if (!confirm('Deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) return;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (!error) fetchOrders();
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('items')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) {
                console.error('Erro ao alternar visibilidade do produto:', error);
                alert('Erro ao atualizar banco: ' + error.message);
                throw error;
            }

            onRefresh();
        } catch (err) {
            console.error('Falha crítica no toggle de produto:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: string | number) => {
        const amount = typeof value === 'string' ? Number(value.replace(/\D/g, "")) / 100 : value / 100;
        return amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const escapeHtml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const handlePrintOrder = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(order.created_at).toLocaleString('pt-BR');

        const itemsHtml = order.order_items?.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold;">
                <span style="flex: 1;">${item.quantity}x ${escapeHtml(item.product_name)}</span>
                <span style="margin-left: 10px;">${formatCurrency(item.price_cents * item.quantity)}</span>
            </div>
        `).join('') || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Impressão de Pedido - #${escapeHtml(order.short_id)}</title>
                    <style>
                        @page { margin: 0; }
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            width: 80mm; 
                            margin: 0; 
                            padding: 5mm;
                            font-size: 12px;
                            color: #000;
                        }
                        .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .footer { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; text-align: center; font-size: 10px; }
                        .section { margin-bottom: 8px; }
                        .title { font-weight: bold; font-size: 16px; text-transform: uppercase; }
                        .obs { background: #f0f0f0; padding: 5px; margin-top: 5px; font-style: italic; border: 1px solid #ddd; }
                        .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">OE BURGUERS</div>
                        <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">PEDIDO #${escapeHtml(order.short_id)}</div>
                        <div style="font-size: 10px;">${escapeHtml(date)}</div>
                    </div>
                    
                    <div class="section">
                        <div style="font-weight: bold; font-size: 13px;">${escapeHtml(order.client_name)}</div>
                        <div>${escapeHtml(order.client_phone)}</div>
                    </div>

                    <div class="section">
                        <div style="font-weight: bold; margin-bottom: 3px; border-bottom: 1px solid #eee;">ITENS DO PEDIDO:</div>
                        ${itemsHtml}
                    </div>

                    <div class="total">
                        TOTAL: ${formatCurrency(order.total_cents)}
                    </div>

                    <div class="section" style="margin-top: 10px;">
                        <div style="font-weight: bold; text-transform: uppercase; font-size: 11px;">ENTREGA / RETIRADA:</div>
                        <div style="font-weight: bold;">${order.is_pickup ? '📦 RETIRADA NO LOCAL' : '🛵 ENTREGA EM DOMICÍLIO'}</div>
                        ${!order.is_pickup ? `
                            <div style="margin-top: 3px;">
                                ${escapeHtml(order.delivery_address)}<br>
                                <strong>Bairro:</strong> ${escapeHtml(order.neighborhood)}
                            </div>
                        ` : ''}
                    </div>

                    <div class="section">
                        <div style="font-weight: bold; text-transform: uppercase; font-size: 11px;">PAGAMENTO:</div>
                        <div>${escapeHtml(order.payment_method.toUpperCase())} (${escapeHtml(order.payment_status.toUpperCase())})</div>
                    </div>

                    ${order.observation ? `
                        <div class="obs">
                            <strong>OBSERVAÇÕES:</strong><br>
                            ${escapeHtml(order.observation)}
                        </div>
                    ` : ''}

                    <div class="footer">
                        Desenvolvido por OE BURGUERS<br>
                        ${escapeHtml(date)}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCurrency(e.target.value);
        setEditingItem({ ...editingItem, displayPrice: formatted });
    };

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Comprimir para WebP (muito mais leve) com fallback para JPEG
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Falha na compressão'));
                        },
                        'image/webp',
                        0.85
                    );
                };
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;
        setLoading(true);
        const { error } = await supabase
            .from('customers')
            .upsert({
                phone: editingClient.phone,
                name: editingClient.name,
                is_archived: editingClient.is_archived || false
            });

        if (!error) {
            setEditingClient(null);
            fetchCustomers();
        } else {
            alert('Erro ao atualizar cliente: ' + error.message);
        }
        setLoading(false);
    };

    const handleArchiveClient = async (phone: string, status: boolean) => {
        const { error } = await supabase
            .from('customers')
            .upsert({ phone, is_archived: status });
        if (!error) fetchCustomers();
    };

    const handleDeleteClient = async (phone: string) => {
        if (!phone || phone === 'sem-telefone') return;
        if (!confirm('Deseja excluir DEFINITIVAMENTE os dados deste cliente da base administrativa? (Os pedidos não serão excluídos)')) return;
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('phone', phone);
        if (!error) fetchCustomers();
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.name || !newClient.phone) return;
        setLoading(true);
        const { error } = await supabase
            .from('customers')
            .insert({
                name: newClient.name,
                phone: newClient.phone.replace(/\D/g, ''),
                is_archived: false
            });
        if (!error) {
            setIsCreatingClient(false);
            setNewClient({ name: '', phone: '' });
            fetchCustomers();
        } else {
            alert('Erro ao criar cliente: ' + error.message);
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            // Compactar imagem antes do envio
            const compressedBlob = await compressImage(file);

            const fileName = `${Math.random().toString(36).substring(2)}.webp`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('oe-burguers-assets')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('oe-burguers-assets')
                .getPublicUrl(filePath);

            setEditingItem({ ...editingItem, image: publicUrl });
        } catch (error: any) {
            console.error('Error uploading:', error);
            alert('Erro ao fazer upload da imagem: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setLoading(true);

        const priceCents = Math.round(Number(editingItem.displayPrice.replace(/\D/g, "")));

        try {
            if (editingItem.id) {
                // Update existing
                const { error: itemError } = await supabase
                    .from('items')
                    .update({
                        name: editingItem.name,
                        description: editingItem.description,
                        image_url: editingItem.image,
                        category_id: editingItem.category_id,
                        is_active: editingItem.isActive !== false
                    })
                    .eq('id', editingItem.id);

                if (itemError) throw itemError;

                const { error: variantError } = await supabase
                    .from('item_variants')
                    .update({ price_cents: priceCents })
                    .eq('item_id', editingItem.id);

                if (variantError) throw variantError;
            } else {
                // Create new item
                const { data: newItem, error: itemError } = await supabase
                    .from('items')
                    .insert({
                        name: editingItem.name || 'Novo Produto',
                        description: editingItem.description || '',
                        image_url: editingItem.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop',
                        category_id: editingItem.category_id || (categories.length > 0 ? categories[0].id : null),
                        price_cents: priceCents, // Some schemas use price_cents directly on items
                        is_active: true
                    })
                    .select()
                    .single();

                if (itemError) throw itemError;

                // Also insert a default variant if the schema uses item_variants
                if (newItem) {
                    const { error: variantError } = await supabase
                        .from('item_variants')
                        .insert({
                            item_id: newItem.id,
                            price_cents: priceCents,
                            name: 'Padrão'
                        });
                    // Silently ignore if variant table doesn't exist or column differs, 
                    // but usually it's required for this project structure
                    if (variantError) console.warn('Variant insertion error (might be expected):', variantError);
                }
            }

            onRefresh();
            setEditingItem(null);
        } catch (error: any) {
            console.error('Operation failed:', error);
            alert('Erro ao processar produto: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir permanentemente este produto? Esta ação não pode ser desfeita.')) return;
        setLoading(true);
        try {
            // First attempt to delete variants (some schemas might not have them or use CASCADE)
            const { error: variantError } = await supabase
                .from('item_variants')
                .delete()
                .eq('item_id', id);

            if (variantError) console.warn('Variant delete error:', variantError);

            const { error: itemError } = await supabase
                .from('items')
                .delete()
                .eq('id', id);

            if (itemError) throw itemError;

            onRefresh();
        } catch (error: any) {
            console.error('Delete failed:', error);
            alert('Erro ao excluir produto: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAddonActive = async (id: string, currentStatus: boolean) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('options')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) {
                console.error('Erro ao alternar visibilidade do adicional:', error);
                alert('Erro ao atualizar adicional: ' + error.message);
                throw error;
            }

            onRefresh();
        } catch (err) {
            console.error('Falha crítica no toggle de adicional:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStoreStatus = async (newStatus: 'auto' | 'open' | 'closed') => {
        const targetStatus = storeStatus === newStatus ? 'auto' : newStatus;
        setLoading(true);
        const { error } = await supabase
            .from('store_config')
            .upsert({ key: 'store_status', value: targetStatus }, { onConflict: 'key' });

        if (!error) {
            onRefresh();
        } else {
            alert('Erro ao atualizar status: ' + error.message);
        }
        setLoading(false);
    };



    const handleUpdateAddon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAddon) return;
        setLoading(true);

        const priceCents = Math.round(Number(editingAddon.displayPrice.replace(/\D/g, "")));

        const { error } = await supabase
            .from('options')
            .update({
                name: editingAddon.name,
                price_delta_cents: priceCents
            })
            .eq('id', editingAddon.id);

        if (!error) {
            setEditingAddon(null);
            onRefresh();
        } else {
            alert('Erro ao atualizar adicional: ' + error.message);
        }
        setLoading(false);
    };

    const startEditing = (product: any) => {
        setEditingItem({
            ...product,
            displayPrice: product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        });
    };

    const renderClientes = () => {
        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-black  tracking-tighter uppercase leading-none">
                                {showArchivedClients ? 'Clientes Arquivados' : 'Gestão de Clientes'}
                            </h2>
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                                {showArchivedClients ? 'Base de clientes inativos ou arquivados' : 'Base de dados e comportamento de compra'}
                            </p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                            {['7', '15', '30', '90', 'all'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range as any)}
                                    className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${timeRange === range ? 'bg-primary text-dark-bg' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {range === 'all' ? 'Tudo' : `${range}D`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                        <div className="relative group flex-1 w-full">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome, telefone ou bairro..."
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                className="w-full bg-dark-card/40 border border-white/5 rounded-lg py-2.5 pl-11 pr-4 text-[11px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-white/10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCreatingClient(true)}
                                className="h-10 px-5 rounded-full bg-primary text-dark-bg font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                            >
                                <span className="material-icons-round text-base">person_add</span>
                                Novo Cliente
                            </button>
                            <button
                                onClick={() => setShowArchivedClients(!showArchivedClients)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showArchivedClients ? 'bg-primary text-dark-bg' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                title={showArchivedClients ? "Ver Ativos" : "Ver Arquivados"}
                            >
                                <span className="material-icons-round text-lg">{showArchivedClients ? 'group' : 'archive'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Dashboard */}
                {!showArchivedClients && (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-dark-card p-3 rounded-xl border border-white/5 space-y-1 premium-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Total Clientes</p>
                            <p className="text-xl font-black ">{clients.length}</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-xl border border-white/5 space-y-1 premium-shadow relative overflow-hidden group text-emerald-500">
                            <p className="text-[8px] font-black text-emerald-500/30 uppercase tracking-[0.2em]">Faturamento Base</p>
                            <p className="text-xl font-black ">{formatCurrency(clients.reduce((acc, curr) => acc + curr.total_spent_cents, 0))}</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-xl border border-white/5 space-y-1 premium-shadow relative overflow-hidden group">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Ticket Médio</p>
                            <p className="text-xl font-black ">{clients.length > 0 ? formatCurrency(clients.reduce((acc, curr) => acc + curr.total_spent_cents, 0) / clients.length) : 'R$ 0,00'}</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-xl border border-white/5 space-y-1 premium-shadow relative overflow-hidden group">
                            <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">Fãs de VIP ⭐</p>
                            <p className="text-xl font-black ">{clients.filter(c => c.total_orders >= 5).length}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                    {clients.map((client) => (
                        <div
                            key={client.phone}
                            onClick={() => setEditingClient(client)}
                            className={`group relative bg-dark-card/40 backdrop-blur-3xl border rounded-2xl p-4 transition-all duration-500 cursor-pointer hover:border-primary/40 active:scale-[0.98] ${client.total_orders >= 5 ? 'border-primary/30 shadow-[0_20px_40px_rgba(255,183,0,0.1)]' : 'border-white/5'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-lg uppercase tracking-tight  group-hover:text-primary transition-colors">
                                            {client.name || 'Cliente sem Nome'}
                                        </h3>
                                        {client.total_orders >= 5 && (
                                            <span className="bg-primary text-dark-bg text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-primary/20 animate-pulse">VIP ⭐</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{client.phone}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setEditingClient(client)}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-primary hover:text-dark-bg transition-all"
                                    >
                                        <span className="material-icons-round text-base">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleArchiveClient(client.phone, !client.is_archived)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${client.is_archived ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40 hover:bg-amber-500/20 hover:text-amber-500'}`}
                                    >
                                        <span className="material-icons-round text-base">{client.is_archived ? 'unarchive' : 'archive'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client.phone)}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <span className="material-icons-round text-base">delete_outline</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5">Pedidos</p>
                                    <p className="text-lg font-black ">{client.total_orders}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5">Investido</p>
                                    <p className="text-lg font-black  text-primary">{formatCurrency(client.total_spent_cents)}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2 text-white/40">
                                    <span className="material-icons-round text-xs">location_on</span>
                                    <p className="text-[9px] font-bold uppercase tracking-wide truncate">{client.neighborhood || 'Bairro ñ inf.'}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/20">
                                        <span className="material-icons-round text-xs">history</span>
                                        <p className="text-[7px] font-black uppercase tracking-widest">Último: {new Date(client.last_order_at).toLocaleDateString()}</p>
                                    </div>
                                    <a
                                        href={`https://wa.me/55${client.phone?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                    >
                                        <span className="material-icons-round text-[12px]">whatsapp</span> Contato
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {clients.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center">
                        <span className="material-icons-round text-6xl mb-4">
                            {showArchivedClients ? 'archive' : 'people_outline'}
                        </span>
                        <p className="text-xs font-black uppercase tracking-[0.3em]">
                            {showArchivedClients ? 'Nenhum cliente arquivado' : 'Nenhum cliente encontrado'}
                        </p>
                    </div>
                )}
                {/* New Client Modal */}
                {isCreatingClient && (
                    <div className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
                        <div className="w-full max-w-sm bg-dark-card border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-black uppercase tracking-widest ">Novo Cliente</h3>
                                    <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">Cadastrar manualmente</p>
                                </div>
                                <button onClick={() => setIsCreatingClient(false)} className="text-white/20 hover:text-white transition-colors">
                                    <span className="material-icons-round text-lg">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreateClient} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Nome</label>
                                    <input
                                        type="text"
                                        required
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="w-full bg-dark-bg border border-white/5 h-14 rounded-xl px-6 text-sm font-black focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-inner"
                                        placeholder="Nome completo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Telefone (WhatsApp)</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="w-full bg-dark-bg border border-white/5 h-14 rounded-xl px-6 text-sm font-black focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-inner"
                                        placeholder="Ex: 22998887766"
                                    />
                                    <p className="text-[8px] text-white/10 ml-2 uppercase font-black tracking-widest">Apenas números com DDD</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-500 py-4 rounded-xl text-dark-bg font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <span className="material-icons-round animate-spin text-sm">refresh</span> : <span className="material-icons-round text-sm">check_circle</span>}
                                    Criar Cliente
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderTabs = () => (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
            <nav className="bg-gradient-to-b from-[#2A1B12]/95 to-[#1A0F0A]/98 backdrop-blur-2xl border border-white/10 rounded-full p-2 lg:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-around relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                {[
                    { id: 'pdv', label: 'PDV', icon: 'point_of_sale' },
                    { id: 'vendas', label: 'Vendas', icon: 'analytics' },
                    { id: 'clientes', label: 'Clientes', icon: 'groups' },
                    { id: 'cozinha', label: 'Cozinha', icon: 'soup_kitchen' },
                    { id: 'cardapio', label: 'Menu', icon: 'restaurant_menu' },
                    { id: 'logistica', label: 'Entrega', icon: 'local_shipping' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AdminTab)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 relative group min-w-[45px] lg:min-w-[55px] ${activeTab === tab.id
                            ? 'text-primary scale-110'
                            : 'text-white/30 hover:text-white/60'
                            }`}
                    >
                        <span className="material-icons-round text-xl transition-transform duration-300">
                            {tab.icon}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.1em] leading-none mb-1">
                            {tab.label}
                        </span>
                    </button>
                ))}
            </nav>
        </div>
    );

    const renderPDV = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-dark-card/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-3 backdrop-blur-3xl premium-shadow mb-4 overflow-hidden relative group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${storeStatus === 'open' ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : storeStatus === 'closed' ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'bg-primary/10 text-primary'}`}>
                            <span className="material-icons-round text-xl">
                                {storeStatus === 'open' ? 'lock_open' : storeStatus === 'closed' ? 'lock' : 'schedule'}
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight opacity-40">Status da Loja</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1 h-1 rounded-full animate-pulse ${storeStatus === 'open' ? 'bg-emerald-500' : storeStatus === 'closed' ? 'bg-rose-500' : 'bg-primary'}`}></span>
                                <p className="text-[9px] text-white font-black uppercase tracking-[0.05em]">
                                    {storeStatus === 'auto' ? 'Automático' : storeStatus === 'open' ? 'Aberto Manual' : 'Fechado Manual'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid for more efficiency */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleUpdateStoreStatus('open')}
                        className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-2 border ${storeStatus === 'open'
                            ? 'bg-emerald-500 border-emerald-400 text-dark-bg shadow-lg shadow-emerald-500/20'
                            : 'bg-white/5 border-white/5 text-white/30 hover:text-emerald-500'
                            }`}
                    >
                        <span className="material-icons-round text-base">check_circle</span>
                        Aberto
                    </button>

                    <button
                        onClick={() => handleUpdateStoreStatus('closed')}
                        className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-2 border ${storeStatus === 'closed'
                            ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                            : 'bg-white/5 border-white/5 text-white/30 hover:text-rose-500'
                            }`}
                    >
                        <span className="material-icons-round text-base">block</span>
                        Fechado
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-black  tracking-tighter uppercase leading-none">
                        {showOrderTrash ? 'Pedidos Cancelados' : 'Fila de Pedidos'}
                    </h2>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                        {showOrderTrash ? 'Lixeira de pedidos' : 'Painel de controle de vendas'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {!showOrderTrash && (
                        <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
                            {orders.filter(o => o.status !== 'finalizado' && o.status !== 'cancelado').length} Ativos
                        </span>
                    )}
                    <button
                        onClick={() => setShowOrderTrash(!showOrderTrash)}
                        className={`w-9 h-9 aspect-square shrink-0 rounded-full flex items-center justify-center transition-all ${showOrderTrash ? 'bg-primary text-dark-bg' : 'bg-white/5 text-white/40 border border-white/10 hover:text-rose-500'}`}
                        title={showOrderTrash ? "Voltar para Fila" : "Ver Lixeira"}
                    >
                        <span className="material-icons-round text-lg">{showOrderTrash ? 'arrow_back' : 'delete_sweep'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(showOrderTrash
                    ? orders.filter(o => o.status === 'cancelado')
                    : orders.filter(o => o.status !== 'finalizado' && o.status !== 'cancelado')
                ).map(order => (
                    <div key={order.id} className={`bg-dark-card/60 backdrop-blur-md border rounded-lg p-4 space-y-3 premium-shadow transition-all ${showOrderTrash ? 'border-rose-500/20 opacity-80' : 'border-white/5 hover:border-primary/20'}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePrintOrder(order)}
                                    className="w-8 h-8 bg-white/5 text-white/40 border border-white/10 rounded-md flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all active:scale-90"
                                    title="Imprimir Pedido"
                                >
                                    <span className="material-icons-round text-sm">print</span>
                                </button>
                                <span className={`px-2 py-1 border rounded-md text-[9px] font-black  ${showOrderTrash ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                    #{order.short_id}
                                </span>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${order.payment_status === 'pago' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>
                                {order.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                            </span>
                        </div>

                        <div className="space-y-0.5">
                            <h3 className="font-black text-base uppercase tracking-tight truncate leading-tight">{order.client_name}</h3>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-wider">{new Date(order.created_at).toLocaleTimeString('pt-BR')}</p>
                        </div>

                        <div className="bg-dark-bg/60 rounded-lg p-4 space-y-2 border border-white/5">
                            {order.order_items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px] font-bold">
                                    <span className="text-white/60">{item.quantity}x {item.product_name}</span>
                                    <span className="text-white/40">{formatCurrency(item.price_cents)}</span>
                                </div>
                            ))}
                            <div className="h-px bg-white/5 my-2"></div>
                            <div className="flex justify-between font-black text-sm text-primary ">
                                <span>TOTAL</span>
                                <span>{formatCurrency(order.total_cents)}</span>
                            </div>
                        </div>

                        {/* Rich Order Details */}
                        <div className={`rounded-lg p-4 border space-y-2.5 ${showOrderTrash ? 'bg-white/5 border-white/5' : 'bg-primary/5 border-primary/10'}`}>
                            <div className="flex items-start gap-3">
                                <span className={`material-icons-round text-sm mt-0.5 ${showOrderTrash ? 'text-white/40' : 'text-primary'}`}>{order.is_pickup ? 'storefront' : 'delivery_dining'}</span>
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${showOrderTrash ? 'text-white/20' : 'text-primary/40'}`}>Tipo / Endereço</p>
                                    <p className="text-[11px] font-bold text-white/80 leading-tight">
                                        {order.is_pickup ? 'RETIRADA NO LOCAL' : `${order.delivery_address}`}
                                    </p>
                                    {!order.is_pickup && <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{order.neighborhood} • {order.zip_code}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`material-icons-round text-sm ${showOrderTrash ? 'text-white/40' : 'text-primary'}`}>payments</span>
                                <div className="space-y-0.5">
                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${showOrderTrash ? 'text-white/20' : 'text-primary/40'}`}>Pagamento</p>
                                    <p className="text-[11px] font-black text-white/80 uppercase">{order.payment_method}</p>
                                </div>
                            </div>

                            {order.observation && (
                                <div className="flex items-start gap-3 bg-dark-bg/40 p-3 rounded-lg border border-white/5">
                                    <span className="material-icons-round text-rose-500 text-sm mt-0.5">assignment</span>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-rose-500/40 tracking-widest leading-none">Observação</p>
                                        <p className="text-[10px] font-medium text-white/60  leading-snug">{order.observation}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            {!showOrderTrash && order.status === 'pendente' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'preparando')}
                                    className="w-full bg-amber-500 text-dark-bg py-4 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/40 active:scale-95 transition-all hover:bg-amber-400"
                                >
                                    <span className="material-icons-round text-sm">restaurant</span> Iniciar Produção
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                {showOrderTrash ? (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'pendente')}
                                            className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-4 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all active:scale-95"
                                        >
                                            <span className="material-icons-round text-sm">restore_from_trash</span> Restaurar
                                        </button>
                                        <button
                                            onClick={() => deleteOrderPermanently(order.id)}
                                            className="bg-rose-500/20 text-rose-500 border border-rose-500/20 py-4 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-rose-500/30 transition-all active:scale-95"
                                        >
                                            <span className="material-icons-round text-sm">delete_forever</span> Excluir
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'cancelado')}
                                            className="bg-white/5 text-rose-500/50 border border-white/10 py-4 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95"
                                        >
                                            <span className="material-icons-round text-sm">cancel</span> Cancelar
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'finalizado')}
                                            className="bg-primary text-dark-bg py-4 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            <span className="material-icons-round text-sm">check_circle</span> Concluir
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {showOrderTrash && orders.filter(o => o.status === 'cancelado').length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                    <span className="material-icons-round text-6xl mb-4">delete_outline</span>
                    <p className="text-sm font-black uppercase tracking-widest">A lixeira está vazia</p>
                </div>
            )}
        </div>
    );

    const renderVendas = () => {
        const totalVendas = filteredOrdersRange.filter(o => o.status === 'finalizado').reduce((acc, curr) => acc + curr.total_cents, 0);
        const pedidosHoje = filteredOrdersRange.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-0.5">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Visão Geral de Vendas</h3>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                        {['7', '15', '30', '90', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range as any)}
                                className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${timeRange === range ? 'bg-primary text-dark-bg' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                {range === 'all' ? 'Tudo' : `${range}D`}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: 'Receita Líquida', value: formatCurrency(totalVendas), color: 'text-primary' },
                        { label: 'Pedidos Total', value: filteredOrdersRange.filter(o => o.status === 'finalizado').length, color: 'text-white' },
                        { label: 'Pedidos Hoje', value: pedidosHoje, color: 'text-white' },
                        { label: 'Ticket Médio', value: filteredOrdersRange.length > 0 ? formatCurrency(totalVendas / filteredOrdersRange.length) : 'R$ 0,00', color: 'text-emerald-500' },
                    ].map((metric, i) => (
                        <div key={i} className="bg-dark-card border border-white/5 p-3 rounded-lg flex flex-col gap-0.5 premium-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                            <span className="text-[7px] font-black uppercase text-white/20 tracking-[0.2em] leading-tight mb-1">{metric.label}</span>
                            <h4 className={`text-xs font-black tracking-tighter leading-none ${metric.color} truncate`}>{metric.value}</h4>
                        </div>
                    ))}
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Histórico de Movimentação</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-6"></div>
                    </div>

                    <div className="bg-dark-card/40 backdrop-blur-md rounded-lg border border-white/5 overflow-hidden premium-shadow">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-white/30 tracking-widest whitespace-nowrap">Data / Hora</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-white/30 tracking-widest whitespace-nowrap">Cliente</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-white/30 tracking-widest text-right whitespace-nowrap">Total</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-white/30 tracking-widest text-center whitespace-nowrap">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-white/30 tracking-widest text-center whitespace-nowrap">Pagamento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredOrdersRange.map(order => (
                                        <tr
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white/80">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-bold text-white/20 group-hover:text-primary transition-colors uppercase">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs font-black uppercase text-white/70 group-hover:text-white transition-colors">{order.client_name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span className="text-xs font-black text-primary ">{formatCurrency(order.total_cents)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${order.status === 'finalizado' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' :
                                                    order.status === 'cancelado' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' :
                                                        'bg-primary/5 text-primary border-primary/20'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center">
                                                    <div className={`w-2 h-2 rounded-full ${order.payment_status === 'pago' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCozinha = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500 h-full flex flex-col">
            <div className="flex flex-col mb-2">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-black  tracking-tighter uppercase">Monitor Cozinha</h2>
                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Acompanhamento de produção</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 flex-1 pb-10">
                {['pendente', 'preparando', 'pronto'].map((status, idx) => (
                    <div key={status} className="bg-dark-card/40 backdrop-blur-xl border border-white/5 rounded-lg p-2 space-y-3 flex flex-col premium-shadow-lg relative overflow-hidden h-[440px]">
                        {/* Dynamic Column Background */}
                        <div className={`absolute top-0 left-0 w-full h-1 opacity-20 ${status === 'pendente' ? 'bg-rose-500' : status === 'preparando' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></div>

                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${status === 'pendente' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' :
                                    status === 'preparando' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' :
                                        'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                                    }`}></div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                                    {status === 'pendente' ? 'Aguardando' : status === 'preparando' ? 'Produção' : 'Pronto'}
                                </h3>
                            </div>
                            <span className="text-[9px] font-black bg-white/5 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                                {orders.filter(o => o.status === status).length}
                            </span>
                        </div>

                        <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 pr-1 pb-2">
                            {filteredOrdersRange.filter(o => o.status === status).map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="bg-dark-card border border-white/10 rounded-lg p-2 space-y-2 hover:border-primary/30 transition-all group animate-in zoom-in-95 premium-shadow cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[8px] font-black  border border-primary/20">#{order.short_id}</div>
                                        <span className="text-[8px] text-white/20 font-black uppercase tracking-wider">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {order.order_items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 text-xs font-bold bg-white/5 p-1 rounded-md border border-white/5">
                                                <span className="text-dark-bg bg-primary w-4 h-4 rounded-md flex items-center justify-center text-[7px] font-black shadow-lg shadow-primary/20">{item.quantity}</span>
                                                <span className="text-white/80 flex-1 leading-tight text-[9px]">{item.product_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const nextStatus = status === 'pendente' ? 'preparando' : status === 'preparando' ? 'pronto' : 'finalizado';
                                            updateOrderStatus(order.id, nextStatus as Order['status']);
                                        }}
                                        className="w-full bg-primary text-dark-bg py-2 rounded-md text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
                                    >
                                        <span className="material-icons-round text-sm">{status === 'pronto' ? 'thumb_up' : 'play_arrow'}</span>
                                        {status === 'pendente' ? 'Começar' : status === 'preparando' ? 'Finalizar' : 'Entregar'}
                                    </button>
                                </div>
                            ))}
                            {orders.filter(o => o.status === status).length === 0 && (
                                <div className="text-center py-12 opacity-5 space-y-2">
                                    <span className="material-icons-round text-5xl">hourglass_empty</span>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em]">Limpo</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCardapio = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-black  tracking-tighter uppercase leading-none">Gestão de Itens</h2>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-none">Controle total do cardápio</p>
                </div>

                {/* Search Bar */}
                <div className="relative group flex-1 max-w-md">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar no cardápio..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="w-full bg-dark-bg/60 border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none transition-all placeholder:text-white/10"
                    />
                    {itemSearch && (
                        <button
                            onClick={() => setItemSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                        >
                            <span className="material-icons-round text-sm">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Sub-nav for Cardapio */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex gap-4">
                    <button
                        onClick={() => setMenuSubTab('products')}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${menuSubTab === 'products' ? 'bg-primary text-dark-bg' : 'bg-white/5 text-white/40 border border-white/5'}`}
                    >
                        Produtos ({products.length} itens)
                    </button>
                    <button
                        onClick={() => setMenuSubTab('addons')}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${menuSubTab === 'addons' ? 'bg-primary text-dark-bg' : 'bg-white/5 text-white/40 border border-white/5'}`}
                    >
                        Adicionais ({addons?.length || 0} itens)
                    </button>
                </div>


            </div>

            {menuSubTab === 'products' ? (
                categories.map(cat => {
                    const catProducts = products.filter(p =>
                        p.category === cat.name &&
                        (searchMatch(p.name, itemSearch) ||
                            searchMatch(p.category, itemSearch))
                    );

                    if (catProducts.length === 0) return null;

                    return (
                        <section key={cat.id} className="space-y-4">
                            <div className="flex items-center gap-3 ml-1">
                                <h2 className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">{cat.name}</h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{catProducts.length} itens</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingItem({
                                                name: '',
                                                description: '',
                                                price: 0,
                                                displayPrice: 'R$ 0,00',
                                                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop',
                                                category_id: cat.id,
                                                isBestSeller: false,
                                                isPopular: false
                                            });
                                        }}
                                        className="w-6 h-6 bg-emerald-500 text-dark-bg rounded-md flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-emerald-500/20 hover:bg-white"
                                        title={`Novo ${cat.name}`}
                                    >
                                        <span className="material-icons-round text-base">add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {catProducts.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => startEditing(product)}
                                        className={`bg-dark-card/60 backdrop-blur-3xl py-3 px-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99] ${product.isActive === false ? 'opacity-40 grayscale blur-[0.5px]' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Image (Addon Style Container) */}
                                            <div className="w-14 h-14 bg-white/5 rounded-xl overflow-hidden border border-white/5 p-1 shrink-0 group-hover:scale-105 transition-transform">
                                                <img src={product.image} className="w-full h-full object-cover rounded-lg" />
                                            </div>

                                            <div className="flex flex-col">
                                                <h4 className="text-xs font-black uppercase text-white group-hover:text-primary transition-colors">{product.name}</h4>
                                                <p className="text-sm font-black text-primary ">
                                                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(product);
                                                }}
                                                className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-dark-bg transition-all border border-primary/20 active:scale-90"
                                                title="Editar"
                                            >
                                                <span className="material-icons-round">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const isActive = product.isActive !== false;
                                                    handleToggleActive(product.id, isActive);
                                                }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${product.isActive !== false ? 'bg-emerald-500 text-dark-bg' : 'bg-white/5 text-white/20 border border-white/5'}`}
                                                title={product.isActive !== false ? "Esconder do Cardápio" : "Mostrar no Cardápio"}
                                            >
                                                <span className="material-icons-round">{product.isActive !== false ? 'visibility' : 'visibility_off'}</span>
                                            </button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })
            ) : (
                <div className="space-y-8">


                    <div className="grid grid-cols-1 gap-3">
                        {(addons || []).map(addon => (
                            <div
                                key={addon.id}
                                onClick={() => setEditingAddon(addon)}
                                className={`bg-dark-card/60 backdrop-blur-3xl py-3 px-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99] ${!addon.is_active ? 'opacity-40 grayscale blur-[0.5px]' : ''}`}
                            >
                                <div className="flex items-center gap-4">

                                    <div className="flex flex-col">
                                        <h4 className="font-black text-sm uppercase tracking-tight text-white mb-0.5">{addon.name}</h4>
                                        <p className="text-primary font-black text-base tracking-tighter">
                                            {(addon.price_delta_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingAddon({
                                                ...addon,
                                                displayPrice: (addon.price_delta_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                            });
                                        }}
                                        className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-dark-bg transition-all border border-primary/20 active:scale-90"
                                    >
                                        <span className="material-icons-round">edit</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleAddonActive(addon.id, !!addon.is_active);
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${addon.is_active ? 'bg-emerald-500 text-dark-bg' : 'bg-white/5 text-white/20 border border-white/5'}`}
                                    >
                                        <span className="material-icons-round">{addon.is_active ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderLogistica = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-5">
            <div className="flex flex-col gap-3">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-black  tracking-tighter uppercase leading-none">
                        {showLogisticaTrash ? 'Lixeira de Logística' : 'Logística de Entrega'}
                    </h2>
                    <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest leading-none">
                        {showLogisticaTrash ? 'Recupere regiões ocultas' : 'Gestão de bairros e taxas automáticas'}
                    </p>
                </div>
            </div>

            {!showLogisticaTrash && (
                <div className="bg-dark-card/40 border border-white/5 p-2 rounded-xl backdrop-blur-3xl premium-shadow">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={newNeighborhood}
                                onChange={(e) => setNewNeighborhood(e.target.value)}
                                placeholder="Bairro / Região (Ex: Jaconé)"
                                className="w-full bg-dark-bg border border-white/5 h-10 rounded-lg px-4 text-[11px] font-bold focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-24 sm:w-32">
                                <input
                                    type="text"
                                    value={newFee}
                                    onChange={(e) => setNewFee(formatCurrency(e.target.value))}
                                    placeholder="R$ 0,00"
                                    className="w-full bg-dark-bg border border-white/5 h-10 rounded-lg px-4 text-[11px] font-bold focus:ring-1 focus:ring-primary outline-none text-primary font-black"
                                />
                            </div>
                            <button
                                onClick={handleAddDeliveryFee}
                                disabled={loading}
                                className="flex-1 sm:flex-none sm:px-6 bg-primary h-10 rounded-lg text-dark-bg font-black uppercase tracking-tight text-[10px] shadow-lg active:scale-95 transition-all hover:bg-white disabled:opacity-50 whitespace-nowrap"
                            >
                                {loading ? '...' : 'Adicionar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4 pb-20">
                <div className="flex items-center gap-2 ml-1">
                    <h2 className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
                        {showLogisticaTrash ? 'Taxas Ocultas' : 'Regiões Atendidas'}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">
                        {(deliveryFees || []).filter(f => showLogisticaTrash ? !f.is_active : f.is_active).length} áreas
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {(deliveryFees || []).filter(f => showLogisticaTrash ? !f.is_active : f.is_active).map(fee => (
                        <div
                            key={fee.id}
                            onClick={() => setEditingFee({
                                ...fee,
                                displayFee: (fee.fee_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            })}
                            className="bg-dark-card/60 backdrop-blur-md p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showLogisticaTrash ? 'bg-white/5 text-white/10' : 'bg-white/5 text-white/20 group-hover:text-primary'}`}>
                                    <span className="material-icons-round text-base">{showLogisticaTrash ? 'delete_outline' : 'local_shipping'}</span>
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <h4 className="font-black text-[11px] uppercase tracking-tight leading-none mb-0.5 truncate">{fee.neighborhood}</h4>
                                    <p className="text-primary font-black text-[10px] tracking-tighter">
                                        {(fee.fee_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {showLogisticaTrash ? (
                                    <>
                                        <button
                                            onClick={() => handleToggleFeeActive(fee.id, false)}
                                            className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center active:scale-90 transition-all border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                            title="Restaurar"
                                        >
                                            <span className="material-icons-round text-lg">restore</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDeliveryFee(fee.id)}
                                            className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center active:scale-90 transition-all border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                                            title="Excluir Definitivamente"
                                        >
                                            <span className="material-icons-round text-lg">delete_forever</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setEditingFee({
                                                ...fee,
                                                displayFee: (fee.fee_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                            })}
                                            className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center active:scale-90 transition-all border border-primary/20 hover:bg-primary hover:text-dark-bg"
                                            title="Editar"
                                        >
                                            <span className="material-icons-round text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleToggleFeeActive(fee.id, true)}
                                            className="w-9 h-9 bg-white/5 text-white/30 rounded-full flex items-center justify-center active:scale-90 transition-all border border-white/10 hover:bg-rose-500/20 hover:text-rose-500"
                                            title="Mover para Lixeira"
                                        >
                                            <span className="material-icons-round text-lg">visibility_off</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDeliveryFee(fee.id)}
                                            className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center active:scale-90 transition-all border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                                            title="Excluir Definitivamente"
                                        >
                                            <span className="material-icons-round text-lg">delete_forever</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-dark-bg flex flex-col text-white pb-10">
            {/* Super Header */}
            <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-dark-bg/80 backdrop-blur-2xl z-50 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-12 h-12 aspect-square shrink-0 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all shadow-2xl hover:bg-primary hover:text-dark-bg hover:border-primary">
                        <span className="material-icons-round text-xl">arrow_back</span>
                    </button>
                    <div className="space-y-0.5">
                        <h1 className="text-[1.12rem] font-black uppercase tracking-tighter  leading-none">OE Administração</h1>
                        <p className="text-[8px] text-primary/60 font-black uppercase tracking-[0.5em] ml-1">Sistema de Controle</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">

                    {activeTab === 'logistica' && (
                        <button
                            onClick={() => setShowLogisticaTrash(!showLogisticaTrash)}
                            className={`w-12 h-12 aspect-square shrink-0 rounded-full flex items-center justify-center transition-all shadow-2xl ${showLogisticaTrash ? 'bg-rose-500 text-white scale-105' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                            title={showLogisticaTrash ? "Ver Taxas Ativas" : "Ver Taxas Ocultas"}
                        >
                            <span className="material-icons-round text-xl">{showLogisticaTrash ? 'local_shipping' : 'auto_delete'}</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (confirm('Deseja realmente sair do painel administrativo?')) {
                                if (onLogout) onLogout();
                            }
                        }}
                        className="w-12 h-12 aspect-square shrink-0 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 active:scale-90 transition-all shadow-2xl hover:bg-rose-500 hover:text-white"
                        title="Sair do Admin"
                    >
                        <span className="material-icons-round text-xl">logout</span>
                    </button>
                </div>
            </header>

            <main className="p-4 pb-24 flex-1 max-w-[1400px] mx-auto w-full">
                {activeTab === 'pdv' && renderPDV()}
                {activeTab === 'vendas' && renderVendas()}
                {activeTab === 'clientes' && renderClientes()}
                {activeTab === 'cardapio' && renderCardapio()}
                {activeTab === 'cozinha' && renderCozinha()}
                {activeTab === 'logistica' && renderLogistica()}
            </main>

            {renderTabs()}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="w-full max-w-lg bg-dark-card border border-white/10 rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-500">
                        <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="space-y-0.5">
                                <h3 className="text-[1.4rem] font-black uppercase tracking-tighter  leading-none">Detalhes do Pedido</h3>
                                <p className="text-[9px] text-primary font-black uppercase tracking-widest ml-1">#{selectedOrder.short_id} • {selectedOrder.status}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 aspect-square shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-rose-500 transition-colors active:scale-95">
                                <span className="material-icons-round text-lg">close</span>
                            </button>
                        </div>

                        <div className="p-6 pt-5 space-y-5 overflow-y-auto no-scrollbar flex-1">
                            <div className="bg-dark-bg/60 rounded-lg p-5 space-y-4 border border-white/5">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Cliente</p>
                                    <h4 className="text-[1.2rem] font-black uppercase  text-primary">{selectedOrder.client_name}</h4>
                                    <p className="text-[10px] font-bold text-white/40">{selectedOrder.client_phone}</p>
                                </div>

                                <div className="h-px bg-white/5"></div>

                                <div className="space-y-3">
                                    <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Itens do Pedido</p>
                                    <div className="space-y-2">
                                        {selectedOrder.order_items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-dark-bg font-black text-[9px]">{item.quantity}x</span>
                                                    <span className="text-[11px] font-bold text-white/80">{item.product_name}</span>
                                                </div>
                                                <span className="text-[11px] font-black text-white/40 ">{formatCurrency(item.price_cents)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-white/5"></div>

                                <div className="flex justify-between items-center">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Total</p>
                                        <p className="text-[1.5rem] font-black  text-primary">{formatCurrency(selectedOrder.total_cents)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Pagamento</p>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${selectedOrder.payment_status === 'pago' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                            {selectedOrder.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5 space-y-1.5">
                                        <div className="flex items-center gap-2 text-primary">
                                            <span className="material-icons-round text-sm">delivery_dining</span>
                                            <p className="text-[9px] font-black uppercase tracking-widest">Entrega</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/70 leading-tight">{selectedOrder.is_pickup ? 'Retirada no Local' : selectedOrder.delivery_address}</p>
                                        {!selectedOrder.is_pickup && <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{selectedOrder.neighborhood}</p>}
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg border border-white/5 space-y-1.5">
                                        <div className="flex items-center gap-2 text-primary">
                                            <span className="material-icons-round text-sm">schedule</span>
                                            <p className="text-[9px] font-black uppercase tracking-widest">Horário</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/70">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(selectedOrder.created_at).toLocaleTimeString('pt-BR')}</p>
                                    </div>
                                </div>

                                {selectedOrder.observation && (
                                    <div className="bg-rose-500/5 p-4 rounded-lg border border-rose-500/10 space-y-1">
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <span className="material-icons-round text-sm">assignment</span>
                                            <p className="text-[9px] font-black uppercase tracking-widest">Observações</p>
                                        </div>
                                        <p className="text-[10px] font-medium text-white/50  leading-snug">{selectedOrder.observation}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex flex-col gap-3 mt-auto">
                            {!showOrderTrash && selectedOrder.status === 'pendente' && (
                                <button
                                    onClick={() => {
                                        updateOrderStatus(selectedOrder.id, 'preparando');
                                        setSelectedOrder(null);
                                    }}
                                    className="w-full bg-amber-500 text-dark-bg py-4 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/40 active:scale-95 transition-all hover:bg-amber-400"
                                >
                                    <span className="material-icons-round text-sm">restaurant</span> Iniciar Produção agora
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                {selectedOrder.status === 'cancelado' ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                updateOrderStatus(selectedOrder.id, 'pendente');
                                                setSelectedOrder(null);
                                            }}
                                            className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-dark-bg transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-round text-xs">restore</span> Restaurar
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteOrderPermanently(selectedOrder.id);
                                                setSelectedOrder(null);
                                            }}
                                            className="bg-rose-500/10 text-rose-500 border border-rose-500/20 py-3.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-round text-xs">delete_forever</span> Excluir
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                updateOrderStatus(selectedOrder.id, 'cancelado');
                                                setSelectedOrder(null);
                                            }}
                                            className="bg-white/5 text-rose-500/50 border border-white/10 py-3.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-round text-xs">delete_sweep</span> Lixeira
                                        </button>
                                        <button
                                            onClick={() => setSelectedOrder(null)}
                                            className="bg-primary text-dark-bg py-3.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            Concluir Visão
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição (Estilizado para o Novo Tema) */}
            {editingItem && (
                <div className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="w-full max-w-lg bg-dark-card border border-white/10 rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-500">
                        <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="space-y-0.5">
                                <h3 className="text-[1.4rem] font-black uppercase tracking-tighter  leading-none">Ajustes Finos</h3>
                                <p className="text-[9px] text-white/20 font-black uppercase tracking-widest ml-1">Configuração de produto</p>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="w-10 h-10 aspect-square shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-rose-500 transition-colors active:scale-95">
                                <span className="material-icons-round text-lg">close</span>
                            </button>
                        </div>

                        <div className="p-6 pt-5 space-y-6 overflow-y-auto no-scrollbar flex-1">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Mídia do Produto</label>
                                <div className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-dark-bg relative group">
                                    <img src={editingItem.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    {loading && (
                                        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center">
                                            <span className="material-icons-round animate-spin text-primary text-3xl">refresh</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 bg-white/5 border border-white/10 h-12 rounded-lg text-white active:scale-95 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-primary/20"
                                    >
                                        <span className="material-icons-round text-lg text-primary">add_a_photo</span>
                                        Local
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = prompt("Cole a URL da imagem:", editingItem.image);
                                            if (url) setEditingItem({ ...editingItem, image: url });
                                        }}
                                        className="flex-1 bg-white/5 border border-white/10 h-12 rounded-lg text-white active:scale-95 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-primary/20"
                                    >
                                        <span className="material-icons-round text-lg text-primary">link</span>
                                        Link
                                    </button>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                            <form onSubmit={handleUpdateItem} className="space-y-6 pb-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Segmentação</label>
                                    <div className="relative">
                                        <select
                                            value={editingItem.category_id}
                                            onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                                            className="w-full bg-dark-bg border border-white/5 h-14 rounded-lg px-6 text-xs focus:ring-2 focus:ring-primary/50 outline-none appearance-none font-bold text-white shadow-inner"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id} className="bg-dark-card">{cat.name}</option>
                                            ))}
                                        </select>
                                        <span className="material-icons-round absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">expand_more</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Identificação</label>
                                        <input
                                            type="text"
                                            value={editingItem.name}
                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                            className="w-full bg-dark-bg border border-white/5 h-14 rounded-lg px-6 text-xs font-black focus:ring-2 focus:ring-primary/50 outline-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Valor OE</label>
                                        <input
                                            type="text"
                                            value={editingItem.displayPrice}
                                            onChange={handlePriceChange}
                                            className="w-full bg-dark-bg border border-white/5 h-14 rounded-lg px-6 text-lg font-black text-primary  focus:ring-2 focus:ring-primary/50 outline-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Descrição Detalhada</label>
                                    <textarea
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-dark-bg border border-white/10 rounded-lg p-6 text-xs font-bold focus:ring-2 focus:ring-primary/50 outline-none resize-none leading-relaxed shadow-inner"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Status e Destaques</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, isBestSeller: !editingItem.isBestSeller })}
                                            className={`h-12 rounded-lg border flex items-center justify-center gap-2 transition-all active:scale-95 ${editingItem.isBestSeller
                                                ? 'bg-primary/20 border-primary text-primary font-black'
                                                : 'bg-white/5 border-white/5 text-white/40'
                                                }`}
                                        >
                                            <span className="material-icons-round text-lg">{editingItem.isBestSeller ? 'star' : 'star_outline'}</span>
                                            <span className="text-[10px] uppercase font-black tracking-widest">Destaque</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, isPopular: !editingItem.isPopular })}
                                            className={`h-12 rounded-lg border flex items-center justify-center gap-2 transition-all active:scale-95 ${editingItem.isPopular
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-500 font-black'
                                                : 'bg-white/5 border-white/5 text-white/40'
                                                }`}
                                        >
                                            <span className="material-icons-round text-lg">{editingItem.isPopular ? 'trending_up' : 'trending_flat'}</span>
                                            <span className="text-[10px] uppercase font-black tracking-widest">Popular</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary h-16 rounded-lg text-dark-bg font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(255,183,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 text-[13px]"
                                >
                                    {loading ? 'Sincronizando...' : (editingItem.id ? 'Publicar Alterações' : 'Publicar Criação')}
                                </button>
                            </form>
                        </div >
                    </div >
                </div >
            )}

            {/* Modal de Edição de Taxa de Entrega */}
            {
                editingFee && (
                    <div className="fixed inset-0 z-[110] bg-dark-bg/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                        <div className="w-full max-w-md bg-dark-card border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black uppercase tracking-tighter  leading-none text-primary">Ajustar Região</h3>
                                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest ml-1">Configuração de logística</p>
                                </div>
                                <button onClick={() => setEditingFee(null)} className="w-10 h-10 aspect-square shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-rose-500 transition-colors active:scale-95">
                                    <span className="material-icons-round text-lg">close</span>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Nome da Região</label>
                                    <input
                                        type="text"
                                        value={editingFee.neighborhood}
                                        onChange={(e) => setEditingFee({ ...editingFee, neighborhood: e.target.value })}
                                        className="w-full bg-dark-bg border border-white/5 h-14 rounded-xl px-6 text-xs font-black focus:ring-2 focus:ring-primary/40 outline-none shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Valor da Taxa</label>
                                    <input
                                        type="text"
                                        value={editingFee.displayFee}
                                        onChange={(e) => {
                                            const formatted = formatCurrency(e.target.value);
                                            setEditingFee({ ...editingFee, displayFee: formatted });
                                        }}
                                        className="w-full bg-dark-bg border border-white/5 h-14 rounded-xl px-6 text-lg font-black text-primary  focus:ring-2 focus:ring-primary/40 outline-none shadow-inner"
                                    />
                                </div>



                                <button
                                    onClick={handleUpdateDeliveryFee}
                                    disabled={loading}
                                    className="w-full bg-primary h-16 rounded-xl text-dark-bg font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(255,183,0,0.2)] active:scale-[0.98] transition-all text-xs disabled:opacity-50"
                                >
                                    {loading ? 'Sincronizando...' : 'Atualizar Região'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Modal de Edição de Adicional */}
            {
                editingAddon && (
                    <div className="fixed inset-0 z-[110] bg-dark-bg/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                        <div className="w-full max-w-md bg-dark-card border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black uppercase tracking-tighter leading-none text-primary">Editar Adicional</h3>
                                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest ml-1">Ajuste de preço e nome</p>
                                </div>
                                <button onClick={() => setEditingAddon(null)} className="w-10 h-10 aspect-square shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-rose-500 transition-colors active:scale-95">
                                    <span className="material-icons-round text-lg">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleUpdateAddon} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Nome do Adicional</label>
                                    <input
                                        type="text"
                                        value={editingAddon.name}
                                        onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                                        className="w-full bg-dark-bg border border-white/5 h-14 rounded-xl px-6 text-xs font-black focus:ring-2 focus:ring-primary/40 outline-none shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-white/20 ml-2 tracking-[0.3em]">Valor do Adicional</label>
                                    <input
                                        type="text"
                                        value={editingAddon.displayPrice}
                                        onChange={(e) => {
                                            const formatted = formatCurrency(e.target.value);
                                            setEditingAddon({ ...editingAddon, displayPrice: formatted });
                                        }}
                                        className="w-full bg-dark-bg border border-white/5 h-14 rounded-xl px-6 text-lg font-black text-primary  focus:ring-2 focus:ring-primary/40 outline-none shadow-inner"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary h-16 rounded-xl text-dark-bg font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(255,183,0,0.2)] active:scale-[0.98] transition-all text-xs"
                                >
                                    {loading ? 'Sincronizando...' : 'Publicar Alteração'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Editor;
