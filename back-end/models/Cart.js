import mongoose from "mongoose";

const { Schema } = mongoose;

const cartSchema = new Schema({

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  items: [
    {
      produtoId: {
        type: Schema.Types.ObjectId,
        ref: 'Produto',
        required: true
      },
      nome: {
        type: String,
        trim: true
      },
      quantidade: {
        type: Number,
        required: true,
        min: 1,
        max: 999,
        validate: {
          validator: Number.isInteger,
          message: 'Quantidade deve ser um número inteiro'
        }
      },
      precoNaCompra: {
        type: Number,
        required: true,
        min: 0
      },
      subtotal: {
        type: Number,
        min: 0
      }
    }
  ],

  valorTotal: {
    type: Number,
    required: true,
    min: 0
  },

  dataDaCompra: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
