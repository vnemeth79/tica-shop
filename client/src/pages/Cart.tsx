import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Cart() {
  const { items, removeItem, clearCart, getTotalItems } = useCart();
  const [, setLocation] = useLocation();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("¡Pedido realizado con éxito! Recibirás un email de confirmación.");
      clearCart();
      setLocation("/");
    },
    onError: (error) => {
      toast.error("Error al realizar el pedido: " + error.message);
    },
  });

  const calculateDiscount = (totalItems: number) => {
    if (totalItems >= 50) return 0.30;
    if (totalItems >= 21) return 0.20;
    if (totalItems >= 6) return 0.10;
    return 0;
  };

  const totalItems = getTotalItems();
  const subtotal = 0; // Prices not set yet
  const discountRate = calculateDiscount(totalItems);
  const discount = subtotal * discountRate;
  const shippingCost = 10;
  const total = subtotal - discount + shippingCost;

  const handleSubmitOrder = () => {
    if (!customerName || !customerEmail || !shippingAddress) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    createOrderMutation.mutate({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      shippingCost,
      total,
      paymentMethod: "Revolut",
      notes,
    });
  };

  return (
    <div className="min-h-screen costa-rica-bg costa-rica-pattern">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-md">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-5xl">🇨🇷</span>
              <div>
                <h1 className="text-2xl font-bold text-green-700">Tica Shop</h1>
                <p className="text-sm text-green-600">Tu Carrito de Compras</p>
              </div>
            </div>
            <a href="/">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Volver a Productos</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  Artículos en tu Carrito ({totalItems} unidades)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Tu carrito está vacío</p>
                    <a href="/">
                      <Button className="mt-4">Ver Productos</Button>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            <span className="text-2xl">{item.emoji}</span>
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} unidades
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Form */}
          <div className="space-y-4">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total de unidades:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento ({(discountRate * 100).toFixed(0)}%):</span>
                    <span className="font-semibold">¡Aplicado!</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-700">${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  * Precios serán confirmados por email
                </p>
                <p className="text-xs text-gray-500">
                  ⏱️ Tiempo de entrega: 1-2 semanas
                </p>
              </CardContent>
            </Card>

            {/* Customer Info Form */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+506 1234 5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección de Envío *</Label>
                    <Textarea
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Calle, número, ciudad, provincia..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instrucciones especiales de entrega..."
                      rows={2}
                    />
                  </div>

                  {/* Payment Info */}
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-green-800">Método de Pago</h4>
                    <p className="text-sm text-gray-700">
                      💳 <strong>Revolut:</strong> +36309975697
                    </p>
                    <p className="text-xs text-gray-600">
                      Recibirás instrucciones de pago por email
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmitOrder}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Procesando..." : "Realizar Pedido"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 mt-12">
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
