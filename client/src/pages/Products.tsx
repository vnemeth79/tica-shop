import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function Products() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<number, boolean>>({});

  const toggleExpanded = (productId: number) => {
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (product: any) => {
    const quantity = quantities[product.id] || 1;
    addItem({
      productId: product.id,
      productName: product.name,
      emoji: product.emoji,
      quantity,
      imageUrl: product.imageUrl
    });
    toast.success(`${product.emoji} ${product.name} agregado al carrito (${quantity} unidades)`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen costa-rica-bg costa-rica-pattern flex items-center justify-center">
        <div className="text-white text-2xl">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen costa-rica-bg costa-rica-pattern">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-5xl">🇨🇷</span>
              <div>
                <h1 className="text-2xl font-bold text-green-700">Tica Shop</h1>
                <p className="text-sm text-green-600">Productos de Costa Rica</p>
              </div>
            </div>
            <a href="/cart">
              <Button size="lg" className="gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Bienvenidos a Tica Shop! 🌴
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Descubre productos innovadores inspirados en la naturaleza de Costa Rica. 
            Calidad premium, diseño tropical, ¡Pura Vida!
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Clickable Image with Lightbox */}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="aspect-square relative overflow-hidden bg-gray-100 cursor-pointer group">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-3 py-1 rounded-full text-sm transition-opacity">
                          🔍 Ver imagen
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>

                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span className="text-3xl">{product.emoji}</span>
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-green-600 font-semibold italic text-base">
                    {product.slogan}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Expandable Description */}
                  <Collapsible 
                    open={expandedProducts[product.id]} 
                    onOpenChange={() => toggleExpanded(product.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 hover:underline transition-colors">
                        {expandedProducts[product.id] ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Ocultar detalles
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Más detalles
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <p className="text-sm text-gray-600 leading-relaxed bg-green-50 p-3 rounded-lg border border-green-100">
                        {product.description}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Cantidad de unidades:
                      </label>
                      <Select
                        value={String(quantities[product.id] || 1)}
                        onValueChange={(value) => 
                          setQuantities(prev => ({ ...prev, [product.id]: Number(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 unidad</SelectItem>
                          <SelectItem value="10">10 unidades</SelectItem>
                          <SelectItem value="25">25 unidades</SelectItem>
                          <SelectItem value="50">50 unidades</SelectItem>
                          <SelectItem value="100">100 unidades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Agregar al Carrito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8">
        <div className="container text-center">
          <p className="text-lg mb-2">🌴 Tica Shop - Productos de Costa Rica 🌴</p>
          <p className="text-sm text-green-200">
            Envíos a toda Costa Rica • Entrega en 1-2 semanas
          </p>
        </div>
      </footer>
    </div>
  );
}
