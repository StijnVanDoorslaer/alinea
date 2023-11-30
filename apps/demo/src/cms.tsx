import alinea from 'alinea'
import {createTestCMS} from 'alinea/core/driver/TestDriver'

namespace schema {
  export const Home = alinea.type('Home', {
    title: alinea.text('Title', {width: 0.5, multiline: true}),
    path: alinea.path('Path', {width: 0.5}),
    hero: alinea.object('Header', {
      fields: alinea.type('Fields', {
        header: alinea.object('Image', {
          fields: alinea.type('Image fields', {
            image: alinea.link.image('Image', {inline: true}),
            credit: alinea.richText('Credit')
          })
        }),
        title: alinea.text('Title', {multiline: true}),
        text: alinea.richText('Text')
      })
    })
  })

  export const Recipe = alinea.type('Recipe', {
    title: alinea.text('Title', {width: 0.5, multiline: true}),
    path: alinea.path('Path', {width: 0.5}),
    header: alinea.object('Header', {
      fields: alinea.type('Image fields', {
        image: alinea.link.image('Image', {inline: true}),
        credit: alinea.richText('Credit')
      })
    }),
    intro: alinea.richText('Intro'),
    ingredients: alinea.richText('Ingredients'),
    instructions: alinea.richText('Instructions')
  })

  export const Recipes = alinea.type('Recipes', {
    title: alinea.text('Title', {width: 0.5, multiline: true}),
    path: alinea.path('Path', {width: 0.5}),
    [alinea.meta]: {
      isContainer: true,
      contains: ['Recipe']
    }
  })
}

export const pages = alinea.root('Pages', {
  index: alinea.page(schema.Home({title: 'Home'})),
  recipes: alinea.page(schema.Recipes({title: 'Recipes'}))
})

export const cms = createTestCMS({
  schema,
  workspaces: {
    main: alinea.workspace('Recipes', {
      pages,
      media: alinea.media(),
      [alinea.meta]: {
        color: '#3F61E8',
        mediaDir: 'public',
        source: 'content'
      }
    })
  }
})
