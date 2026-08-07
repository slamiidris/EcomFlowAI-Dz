import { TrendingUp, ArrowUpRight, BarChart3, Search, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function MarketTrends() {
  const trendingProducts = [
    { name: 'Épilateur Laser IPL', trend: '+140%', volume: 'Élevé', category: 'Cosmétique' },
    { name: 'Mini Projecteur HD', trend: '+85%', volume: 'Moyen', category: 'Tech' },
    { name: 'Brosse Nettoyante Électrique', trend: '+120%', volume: 'Élevé', category: 'Cosmétique' },
    { name: 'Organisateur de Cuisine', trend: '+60%', volume: 'Moyen', category: 'Maison' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <TrendingUp size={24} />
          </div>
          Tendances du Marché Algérien
        </h1>
        <p className="text-white/50 px-1">Restez informé sur ce qui se vend le mieux en ce moment en Algérie.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-white/10 rounded-lg text-white">
                   <ShoppingBag size={18} />
                 </div>
                 <h3 className="font-bold text-white uppercase text-xs tracking-widest">Produits à Fort Potentiel</h3>
              </div>
              <BarChart3 size={18} className="text-white/20" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Produit</th>
                    <th className="px-6 py-4 font-bold">Catégorie</th>
                    <th className="px-6 py-4 font-bold">Croissance</th>
                    <th className="px-6 py-4 font-bold">Volume Search</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trendingProducts.map((p) => (
                    <tr key={p.name} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5 text-sm text-white font-semibold">{p.name}</td>
                      <td className="px-6 py-5 text-white/40 text-xs">{p.category}</td>
                      <td className="px-6 py-5 font-mono text-sm text-emerald-400 font-bold">{p.trend}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 rounded-full text-[10px] font-bold uppercase">
                          {p.volume}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-sm">
            <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
              <TrendingUp size={16} /> Opportunité de Saison
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              L'approche de l'été voit une augmentation massive de la demande pour les **articles de bureau portables** et les **systèmes de refroidissement**. Le stock local est limité, ce qui favorise les prix premium.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-white/60">Mots Clés Populaires (DZ)</h3>
            <div className="flex flex-wrap gap-2">
              {['Livraison 58 wilayas', 'Meilleur prix Algérie', 'Original', 'Garanti', 'Promo Ramadhan', 'Check product'].map(tag => (
                <span key={tag} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/50 text-xs font-medium hover:border-emerald-500/50 hover:text-white transition-all cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest text-white/60">Plateformes Ads</h3>
            <div className="space-y-5">
              {[
                { name: 'Facebook Ads', rate: 85, color: 'bg-emerald-500' },
                { name: 'TikTok Ads', rate: 65, color: 'bg-emerald-400' },
                { name: 'Instagram', rate: 45, color: 'bg-emerald-600' },
              ].map(plat => (
                <div key={plat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-medium">{plat.name}</span>
                    <span className="text-white font-bold text-xs">{plat.rate}% util.</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full", plat.color)} style={{ width: `${plat.rate}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
