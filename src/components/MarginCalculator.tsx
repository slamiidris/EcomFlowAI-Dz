import { useState } from 'react';
import { Calculator, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function MarginCalculator() {
  const [values, setValues] = useState({
    productCost: 1500,
    sellingPrice: 3500,
    shippingCost: 600,
    confirmationRate: 80,
    deliveryRate: 70,
    adSpendPerOrder: 500,
  });

  const calculateMetrics = () => {
    // We expect confirmationRate and deliveryRate to be percentages
    const confirmedCount = values.confirmationRate / 100;
    const deliveredCount = (values.confirmationRate / 100) * (values.deliveryRate / 100);
    
    // Revenue is only from delivered packages
    const totalRevenue = values.sellingPrice * deliveredCount;
    // Costs: Product cost for all delivered, Shipping cost for all sent (confirmed), Ad spend for all leads (1 lead = 1 calculation base here)
    const totalProductCost = values.productCost * deliveredCount;
    const totalShippingCost = values.shippingCost * confirmedCount; 
    const totalAdCost = values.adSpendPerOrder; // Per 1 order attempt

    const netProfit = totalRevenue - totalProductCost - totalShippingCost - totalAdCost;
    const margin = (netProfit / totalRevenue) * 100;

    return {
      netProfit: Math.round(netProfit),
      margin: Math.round(margin),
      deliveredCount,
      totalRevenue
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Calculator className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Calculateur de Marge DZD</h2>
          <p className="text-gray-400">Optimisez vos profits sur le marché algérien</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Calculator size={18} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Paramètres de Vente</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Prix de Vente (DZD)</label>
              <input
                type="number"
                value={values.sellingPrice}
                onChange={(e) => setValues({ ...values, sellingPrice: Number(e.target.value) })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Coût Produit (Achat DZD)</label>
              <input
                type="number"
                value={values.productCost}
                onChange={(e) => setValues({ ...values, productCost: Number(e.target.value) })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Coût Livraison Moyen (DZD)</label>
              <input
                type="number"
                value={values.shippingCost}
                onChange={(e) => setValues({ ...values, shippingCost: Number(e.target.value) })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Coût Publicitaire par Lead (DZD)</label>
              <input
                type="number"
                value={values.adSpendPerOrder}
                onChange={(e) => setValues({ ...values, adSpendPerOrder: Number(e.target.value) })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Taux de Confirmation (%)</label>
                <input
                  type="number"
                  value={values.confirmationRate}
                  onChange={(e) => setValues({ ...values, confirmationRate: Number(e.target.value) })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Taux de Livraison (%)</label>
                <input
                  type="number"
                  value={values.deliveryRate}
                  onChange={(e) => setValues({ ...values, deliveryRate: Number(e.target.value) })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6"
            >
              <p className="text-sm font-medium text-emerald-400 mb-1">Profit Net / Lead</p>
              <p className="text-3xl font-bold text-white">{metrics.netProfit} DZD</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "backdrop-blur-md border rounded-2xl p-6",
                metrics.margin > 30 ? "bg-emerald-500/20 border-emerald-500/20" : "bg-orange-500/20 border-orange-500/20"
              )}
            >
              <p className="text-sm font-medium text-gray-400 mb-1">Marge Brute</p>
              <p className="text-3xl font-bold text-white">{metrics.margin}%</p>
            </motion.div>
          </div>

          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Analyse du Business
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Performance</span>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                    <span className="text-xs text-gray-400">Succès Livraison</span>
                    <span className={cn(
                      "text-xs font-bold",
                      (values.confirmationRate * values.deliveryRate / 100) > 55 ? "text-emerald-400" : "text-orange-400"
                    )}>
                      {(values.confirmationRate * values.deliveryRate / 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Benchmarks</span>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                    <span className="text-xs text-gray-400">Moyenne Marché</span>
                    <span className="text-xs font-bold text-emerald-400">55-60%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-400" />
                  Insights Actionnables
                </h4>
                
                <div className="grid gap-3">
                  {/* Insight 1: Marge & Profitabilité Globale */}
                  {metrics.margin < 15 ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="font-black uppercase tracking-wider">État d'Urgence (Marge &lt; 15%)</span>
                      </div>
                      <p className="leading-relaxed">
                        Votre rentabilité est épuisée par les coûts fixes. 
                        <strong> Action immédiate :</strong> Augmentez votre prix de vente d'au moins 400-600 DZD ou négociez le prix d'achat fournisseur. Si le marché refuse, testez un <strong>Upsell obligatoire</strong> (ex: "Acheter 2 = Livraison Gratuite").
                      </p>
                    </div>
                  ) : metrics.margin >= 15 && metrics.margin < 30 ? (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-xs text-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        <span className="font-black uppercase tracking-wider">En Phase de Stabilisation (15-30%)</span>
                      </div>
                      <p className="leading-relaxed">
                        Votre business survit mais ne scale pas encore. 
                        <strong> Stratégie :</strong> Travaillez sur votre "Order Bump" au téléphone pour augmenter le panier moyen de 30% sans augmenter vos frais publicitaires.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="font-black uppercase tracking-wider">Machine à Cash (&gt; 30%)</span>
                      </div>
                      <p className="leading-relaxed">
                        Rentabilité exceptionnelle. <strong>Scale Immédiat :</strong> Augmentez votre budget publicitaire quotidien de 20% tous les 2 jours tant que le CPA reste stable. Introduisez des <strong>Bundles (Packs)</strong> pour maximiser le profit net par colis livré.
                      </p>
                    </div>
                  )}

                  {/* Insight 2: Confirmation */}
                  {values.confirmationRate < 75 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold uppercase tracking-tight text-[10px] text-amber-400">Fuite de Leads ⚠️</span>
                      </div>
                      Votre taux de confirmation est sous la moyenne (75%). <span className="underline decoration-amber-500/50">Recrutez un agent</span> dédié qui rappelle les commandes en moins de 15 minutes. Le "Speed to Lead" est votre premier moteur de croissance.
                    </div>
                  )}

                  {/* Insight 3: Livraison */}
                  {values.deliveryRate < 60 ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold uppercase tracking-tight text-[10px] text-rose-400">Logistique Critique 🚛</span>
                      </div>
                      Taux de retour trop élevé. Désactivez les wilayas du Sud si vous n'avez pas de transporteur fiable là-bas. Activez l'envoi de <strong>SMS automatisés</strong> à chaque étape (Expédié / Arrivé au bureau).
                    </div>
                  ) : values.deliveryRate >= 80 && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-100">
                      <div className="flex items-center gap-2 mb-1 text-emerald-400">
                        <span className="font-bold uppercase tracking-tight text-[10px]">Elite Logistique 🏆</span>
                      </div>
                      Votre taux de livraison est excellent. C'est le moment d'investir dans un <strong>Stock plus important</strong> pour réduire vos coûts d'achat unitaires et exploser vos marges.
                    </div>
                  )}

                  {/* Insight 4: Ads Cost */}
                  {values.adSpendPerOrder > values.sellingPrice * 0.25 && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-xs text-purple-100">
                      <div className="flex items-center gap-1 mb-1 text-purple-400">
                         <span className="font-bold uppercase tracking-tight text-[10px]">Marketing Inefficace 📉</span>
                      </div>
                      Votre budget pub dévore vos profits. Retestez vos créatives (vidéos UGC) ou simplifiez votre page de vente. Un bon produit en Algérie doit avoir un CPA &lt; 15% du prix de vente.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase mb-2">Objectifs Recommandés (Algérie)</h4>
                  <ul className="text-[11px] text-gray-400 space-y-1.5 list-disc pl-4">
                    <li><span className="text-white">Panier Moyen:</span> Visez {values.productCost * 2.5} DZD minimum.</li>
                    <li><span className="text-white">Confirmation:</span> Ciblez 85%+ avec une équipe dédiée.</li>
                    <li><span className="text-white">Frais de Retour:</span> Ne doivent pas dépasser 15% de votre CA brut.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
