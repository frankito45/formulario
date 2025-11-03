import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

type PedidoData = {
    local: string;
    fecha: string;
    pollo: number;
    mila: number;
    pata: number;
    alita: number;
    suprema: number;
    menudo: number;
    rebosador: number;
};

// Schema de validación para el formulario de pedidos
const pedidoSchema = z.object({
    local: z.enum(['opcion1', 'opcion2'], {
        required_error: "Debe seleccionar un local",
        invalid_type_error: "Local no válido"
    }),
    fecha: z.string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
            message: "Formato de fecha inválido (debe ser dd/mm/yyyy)"
        }),
    pollo: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    mila: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    pata: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    alita: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    suprema: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    menudo: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    rebosador: z.number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
}).refine((data) => {
    // Validar que al menos un producto tenga cantidad mayor a 0
    const numericalFields = ['pollo', 'mila', 'pata', 'alita', 'suprema', 'menudo', 'rebosador'];
    return numericalFields.some(field => (data[field as keyof PedidoData] as number) > 0);
}, {
    message: "Debe ingresar al menos un producto",
    path: ["general"] // Este error se mostrará como error general
});

export const procesarPedido = defineAction({
    accept: 'form',
    input: pedidoSchema,
    handler: async (input) => {
        try {
            // Aquí puedes agregar la lógica para procesar el pedido
            // Por ejemplo, enviarlo a una API externa o guardarlo en una base de datos
            
            // Ejemplo de envío a una API externa:
            const response = await fetch('https://web-66vzoi1semdv.up-de-fra1-k8s-1.apps.run-on-seenode.com/stock/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input)
            });

            // Primero verificamos el tipo de contenido de la respuesta
            const contentType = response.headers.get("content-type");
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error al procesar el pedido: ${response.status} ${response.statusText}`);
            }

            // Si el contenido no es JSON, mostramos un error más descriptivo
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no válida:', text);
                throw new Error('El servidor no respondió con JSON válido');
            }

            const data = await response.json();
            return {
                success: true,
                message: 'Pedido procesado correctamente',
                data: data
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido al procesar el pedido'
            };
        }
    }
});