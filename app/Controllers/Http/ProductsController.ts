import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'

import Product from 'App/Models/Product'
import UpdateProductValidator from 'App/Validators/UpdateProductValidator'
import {Attachment} from "@ioc:Adonis/Addons/AttachmentLite"
import NewProductValidator from 'App/Validators/NewProductValidator'

export default class ProductsController {
  public async index({}: HttpContextContract) {
    return Product.query()
  }
  public async store({ request, response }: HttpContextContract) {
    
    const { image, ingredients, ...data } = await request.validate(NewProductValidator)

    const sla = ingredients.reduce<{[ingredientId:number]: {quantity: number}}>((acc, curr) => {
      return {...acc,
        [curr.ingredientId]:{
        quantity: curr.quantity,
        }}
      },{})

    const category = await Category.findOrFail(data.categoryId)
    const product = await category.related('products').create({...data})
    product.related('ingredients').attach(sla)
    ingredients.forEach
    ((ingredient)=>product.related('ingredients').attach({[ingredient.ingredientId]:{quantity: ingredient.quantity}}))
    if (image){
    product.image = Attachment.fromFile(image)
    }
    await product.save()

    return response.json(product)
  }
  public async show({ params }: HttpContextContract) {
    return Product.findOrFail(params.id)
  }
  public async update({ request, response, params }: HttpContextContract) {
    const { image, ...data } = await request.validate(UpdateProductValidator)

    const product = await Product.findOrFail(params.id)

    product.merge(data)

    if (image) {
      product.image = Attachment.fromFile(image)
    }

    await product.save()

    return response.json(product)
  }

  async search({ request }: HttpContextContract) {
    const { name } = request.qs()



    return Product.query().where('name', 'like', `%${name}%`)
  }
}
