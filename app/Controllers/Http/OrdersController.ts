import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import Product from 'App/Models/Product'
import NewOrderValidator from 'App/Validators/NewOrderValidator'

export default class OrdersController {
  async index({}: HttpContextContract) {
    const orders = await  Order.query().preload('products', (query)=>{
      query.preload('ingredients')
      query.pivotColumns(['quantity'])

    })


    return orders.map((order)=>{
      return {
        id: order.id,
        userName: order.userName,
        total: order.total,
        status: order.status,
        products: order.products.map((product)=>{
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.$extras.pivot_quantity,
           
            ingredients: product.ingredients.map((ingredient)=>{
              return {
                id: ingredient.id,
                name: ingredient.name,
                quantity: ingredient.$extras.pivot_quantity,
              }
            })
          }
        })
      }
    })
  }
  async store({ request, response }: HttpContextContract) {
    try {
      const { userName, products } = await request.validate(NewOrderValidator)

      const productsFromDb = await Product.query()

      const order = await Order.create({ userName })

      let total = products.reduce((acc, curr) => {
        const produto = productsFromDb.find((product) => product.id === curr.productId)
        if (!produto) {
          throw new Error('404')
        }
        return acc + curr.quantity * produto.price
      }, 0)

      const toAttachProducts = products.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.productId]: {
            quantity: curr.quantity,
          },
        }
      }, {})

      order.related('products').attach(toAttachProducts)
      order.total = total
      await order.save()

      return response.json({id: order.id,
        userName: order.userName,
        total: order.total,
        status: order.status

        
        , products: (await order.related('products').query().pivotColumns(["quantity"])).map(product =>({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.$extras.pivot_quantity
      })) })
    } catch (err) {
      if (err.message === '404') {
        return response.status(404).json({ error: 'Algum dos produtos não foi encontrado' })
      }
    }
  }
  async show({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const order = await Order.findOrFail(id)
    return response.json({ order })
  }
  async update({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const { status } = request.body()
    const order = await Order.query().where('id', id).preload("products", (query)=>{
      query.preload('ingredients')
      query.pivotColumns(['quantity'])
    }).firstOrFail()
    order.merge({status})
    await order.save()
    return response.json({
      id: order.id,
      userName: order.userName,
      total: order.total,
      status: order.status,
      products: order.products.map((product)=>{
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.$extras.pivot_quantity,
         
          ingredients: product.ingredients.map((ingredient)=>{
            return {
              id: ingredient.id,
              name: ingredient.name,
              quantity: ingredient.$extras.pivot_quantity,
            }
          })
        }
      })
    })
  }
  async destroy({request, response}: HttpContextContract) {
    const { id } = request.params()
    const order = await Order.findOrFail(id)
    await order.delete()
    return response.status(204)
  }
}
