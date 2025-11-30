import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useSuspenseQuery, queryOptions} from '@tanstack/react-query'
import { fetchIdea, updateIdea } from '@/api/ideas'

const ideaQueryOptions = (ideaId: string) => 
  queryOptions({
    queryKey: ['idea', ideaId],
    queryFn: () => fetchIdea(ideaId)
  })


export const Route = createFileRoute('/ideas/$ideasid/edit')({
  component: IdeaEditPage,
  loader: async ({params, context: {queryClient} }) => {
    return queryClient.ensureQueryData(ideaQueryOptions(params.ideasid))
  }
})

function IdeaEditPage() {
const {ideasid} = Route.useParams()
const navigate = useNavigate()
const {data: idea} = useSuspenseQuery(ideaQueryOptions(ideasid))

const [title, setTitle] = useState(idea.title)
const [summary, setSummary] = useState(idea.summary)
const [description, setDescription] = useState(idea.description)
const [tagsInput, setTagsInput] = useState(idea.tags.join(', '))

const { mutateAsync, isPending} = useMutation({
  mutationFn: () => updateIdea(ideasid,{
    title,
    summary,
    description,
    tags: tagsInput.split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
  }),
  onSuccess: () => {
    navigate({to: `/ideas/$ideasid`, params: {ideasid}})
  }
})

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
await mutateAsync()
} 

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Idea</h1>
        <Link to='/ideas/$ideasid' params={{ideasid}}
        className='text-sm text-blue-600 hover:underline'
        >Back To Idea</Link>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="Title" className='block text-gray-700 font-medium mb-1'>Title

          </label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
          className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter idea title'
          />
        </div>
        <div>
          <label htmlFor="Summary" className='block text-gray-700 font-medium mb-1'>Summary

          </label>
          <input type="text" id="summary" value={summary} onChange={(e) => setSummary(e.target.value)}
          className='w-full border  border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter idea title'
          />
        </div>
        <div>
          <label htmlFor="body" className='block text-gray-700 font-medium mb-1'>Description

          </label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
          className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter idea title'
          />
        </div>
        <div>
          <label htmlFor="tags" className='block text-gray-700 font-medium mb-1'>Tags

          </label>
          <input type="text" id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
          className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter idea title'
          />
        </div>
        <div className="mt-5">
          <button disabled={isPending} className="block w-full border bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? 'Updating' : 'Update Idea'}</button>
        </div>
      </form>
    </div>
  )
}
