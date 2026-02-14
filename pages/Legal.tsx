
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface LegalProps {
    slug: 'privacy-policy' | 'terms-of-use';
    onBack: () => void;
}

const Legal: React.FC<LegalProps> = ({ slug, onBack }) => {
    const [doc, setDoc] = useState<{ title: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_legal_docs')
                .select('title, content')
                .eq('slug', slug)
                .single();

            if (!error && data) {
                setDoc(data);
            }
            setLoading(false);
        };

        fetchDoc();
    }, [slug]);

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <header className="px-6 pt-12 pb-6 relative flex items-center justify-center bg-dark-bg/95 backdrop-blur-md z-40 border-b border-white/5">
                <button
                    onClick={onBack}
                    className="absolute left-6 w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all"
                >
                    <span className="material-icons-round">arrow_back_ios_new</span>
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black">{loading ? 'Carregando...' : doc?.title}</h1>
                    <p className="text-[9px] text-dark-text-secondary uppercase tracking-widest font-bold">Documento Oficial OE BURGUERS</p>
                </div>
            </header>

            <main className="p-6 pb-20 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando com a nuvem</p>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {doc && doc.content ? doc.content.split('\n').map((line, i) => {
                            if (line.startsWith('## ')) {
                                return <h2 key={i} className="text-primary text-base font-black mt-6 mb-3 tracking-tighter">{line.replace('## ', '')}</h2>;
                            }
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i} className="text-dark-text-secondary text-[11px] leading-relaxed mb-3">{line}</p>;
                        }) : (
                            <p className="text-dark-text-secondary text-[11px] text-center opacity-50">Conteúdo não disponível.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Legal;
