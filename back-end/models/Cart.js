import mongoose from "mongoose";

const { Schema } = mongoose;

const cartSchema = new Schema({

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  items: [
    {
      produtoId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantidade: {
        type: Number,
        required: true,
        min: 1
      },
      precoNaCompra: {
        type: Number,
        required: true
      }
    }
  ],
  
  valorTotal: {
    type: Number,
    required: true
  },
  
  dataDaCompra: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;