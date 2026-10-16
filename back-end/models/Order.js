import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
    {
        produtoId: {
            type: Schema.Types.ObjectId,
            ref: "Produto",
            required: true,
        },
        nome: {
            type: String,
            trim: true,
        },
        quantidade: {
            type: Number,
            required: true,
            min: 1,
            max: 999,
            validate: {
                validator: Number.isInteger,
                message: 'Quantidade deve ser um número inteiro',
            },
        },
        preco: {
            type: Number,
            required: true,
            min: 0,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        idempotencyKey: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 128,
        },
        cartId: {
            type: Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "Pedido deve conter ao menos um item",
            },
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            default: "pago_simulado",
            enum: ["pago_simulado"],
        },
    },
    { timestamps: true }
);

orderSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
orderSchema.index({ cartId: 1 }, { unique: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
