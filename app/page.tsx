"use client"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/dashboard")
}

// export default function RedditPostGenerator() {
//   const [step, setStep] = useState(1)
//   const [productDescription, setProductDescription] = useState("")
//   const [selectedSubreddit, setSelectedSubreddit] = useState("")
//   const [selectedTone, setSelectedTone] = useState("founder-story")
//   const [postTitle, setPostTitle] = useState("")
//   const [postBody, setPostBody] = useState("")
//   const [postTldr, setPostTldr] = useState("")
//   const [usageCount, setUsageCount] = useState(0)
//   const [loading, setLoading] = useState(false)
//
//   // Mock subreddit data - in a real app, this would come from an API call
//   const subreddits = [
//     {
//       name: "r/SideProject",
//       relevance: 95,
//       description: "Community for sharing side projects and getting feedback",
//       selfPromo: "Allowed with context",
//     },
//     {
//       name: "r/startups",
//       relevance: 87,
//       description: "Startup founders sharing experiences and seeking advice",
//       selfPromo: "Allowed on specific days",
//     },
//     {
//       name: "r/Entrepreneur",
//       relevance: 82,
//       description: "Entrepreneurial discussions and product validation",
//       selfPromo: "Limited, must provide value",
//     },
//     {
//       name: "r/indiehackers",
//       relevance: 78,
//       description: "Independent developers building profitable businesses",
//       selfPromo: "Allowed with context",
//     },
//   ]
//
//   const handleFindSubreddits = () => {
//     if (!productDescription.trim()) {
//       toast({
//         title: "Error",
//         description: "Please describe your product first",
//         variant: "destructive",
//       })
//       return
//     }
//
//     setLoading(true)
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false)
//       setStep(2)
//     }, 1500)
//   }
//
//   const handleGeneratePost = () => {
//     if (!selectedSubreddit) {
//       toast({
//         title: "Error",
//         description: "Please select a subreddit first",
//         variant: "destructive",
//       })
//       return
//     }
//
//     setLoading(true)
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false)
//       setUsageCount(usageCount + 1)
//
//       // Mock generated content
//       const tones = {
//         "founder-story": {
//           title: "I built a tool to help [specific problem] after struggling with it myself",
//           body:
//             "Hey r/" +
//             selectedSubreddit.substring(2) +
//             ",\n\nAfter months of frustration with existing solutions, I decided to build something better. " +
//             productDescription +
//             "\n\nThe journey wasn't easy - I spent countless nights coding and redesigning the UI based on early user feedback. I'd love to hear what you think and if this solves a pain point for you too.\n\nWhat features would you like to see added?",
//           tldr: "Built a tool to solve my own problem, would love your feedback!",
//         },
//         feedback: {
//           title: "[Feedback Request] Would this solve your problem?",
//           body:
//             "Hi r/" +
//             selectedSubreddit.substring(2) +
//             ",\n\nI've been working on: " +
//             productDescription +
//             "\n\nI'm still in the early stages and would really appreciate honest feedback from this community. What works? What doesn't? Would you use this?\n\nThanks in advance for any insights!",
//           tldr: "Built a new tool, seeking honest feedback before I continue development.",
//         },
//         question: {
//           title: "Has anyone found a good solution for [problem your product solves]?",
//           body:
//             "I've been struggling with [problem] for a while now. " +
//             productDescription +
//             " seems to address this, but I'm curious if anyone here has experience with similar tools or approaches?\n\nWhat worked for you? Any pitfalls I should be aware of?",
//           tldr: "Looking for solutions to [problem], considering building something myself.",
//         },
//         "free-tool": {
//           title: "I made a free tool that [main benefit] - no strings attached",
//           body:
//             "Hey r/" +
//             selectedSubreddit.substring(2) +
//             ",\n\nI wanted to share something I built that might be useful for this community: " +
//             productDescription +
//             "\n\nIt's completely free to use. I built it because I needed it myself and thought others might benefit too.\n\nLink: [your-link-here]\n\nLet me know what you think or if you have feature suggestions!",
//           tldr: "Free tool for [benefit] - no account required, feedback welcome!",
//         },
//       }
//
//       setPostTitle(tones[selectedTone].title)
//       setPostBody(tones[selectedTone].body)
//       setPostTldr(tones[selectedTone].tldr)
//       setStep(3)
//     }, 1500)
//   }
//
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text)
//     toast({
//       title: "Copied!",
//       description: "Post copied to clipboard",
//     })
//   }
//
//   const showUpgradePrompt = () => {
//     if (usageCount >= 2) {
//       toast({
//         title: "Usage limit reached",
//         description: "Upgrade for unlimited drafts and more features",
//         action: (
//           <Button variant="default" size="sm" onClick={() => console.log("Upgrade clicked")}>
//             Upgrade
//           </Button>
//         ),
//       })
//       return true
//     }
//     return false
//   }
//
//   return (
//     <div className="container max-w-3xl mx-auto pt-8 pb-8 px-4">
//       <h1 className="text-3xl font-bold text-center mb-8">Reddit Post Generator</h1>
//
//       {/* Step indicators */}
//       <div className="flex justify-between mb-8">
//         <div className={`flex flex-col items-center ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
//           <div
//             className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
//           >
//             1
//           </div>
//           <span className="text-sm">Product</span>
//         </div>
//         <div className="grow border-t border-dashed my-4 mx-2"></div>
//         <div className={`flex flex-col items-center ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
//           <div
//             className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
//           >
//             2
//           </div>
//           <span className="text-sm">Subreddits</span>
//         </div>
//         <div className="grow border-t border-dashed my-4 mx-2"></div>
//         <div className={`flex flex-col items-center ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
//           <div
//             className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
//           >
//             3
//           </div>
//           <span className="text-sm">Post</span>
//         </div>
//       </div>
//
//       {/* Step 1: Product Description */}
//       {step === 1 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Describe Your Product</CardTitle>
//             <CardDescription>
//               Tell us about your product in 1-3 sentences so we can find the best subreddits for you.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Textarea
//               placeholder="My product helps entrepreneurs find the perfect subreddits to share their work and automatically drafts posts that match each community's style..."
//               value={productDescription}
//               onChange={(e) => setProductDescription(e.target.value)}
//               rows={5}
//               className="mb-4"
//             />
//           </CardContent>
//           <CardFooter className="flex justify-end">
//             <Button onClick={handleFindSubreddits} disabled={loading || !productDescription.trim()}>
//               {loading ? "Finding Subreddits..." : "Find Subreddits"}
//               {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
//             </Button>
//           </CardFooter>
//         </Card>
//       )}
//
//       {/* Step 2: Subreddit Suggestions */}
//       {step === 2 && (
//         <div>
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle>Recommended Subreddits</CardTitle>
//               <CardDescription>Select a subreddit to generate a post tailored to that community.</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {subreddits.map((subreddit) => (
//                   <div
//                     key={subreddit.name}
//                     className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedSubreddit === subreddit.name ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
//                     onClick={() => setSelectedSubreddit(subreddit.name)}
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-medium text-lg">{subreddit.name}</h3>
//                         <p className="text-muted-foreground text-sm">{subreddit.description}</p>
//                       </div>
//                       <Badge variant="outline" className="ml-2">
//                         {subreddit.relevance}% match
//                       </Badge>
//                     </div>
//                     <div className="mt-2 text-xs text-muted-foreground">
//                       <span className="font-medium">Self-promotion:</span> {subreddit.selfPromo}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//             <CardFooter className="flex justify-between">
//               <Button variant="outline" onClick={() => setStep(1)}>
//                 Back
//               </Button>
//               <Button onClick={handleGeneratePost} disabled={loading || !selectedSubreddit}>
//                 {loading ? "Generating Post..." : "Generate Post"}
//                 {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//       )}
//
//       {/* Step 3: Generated Post */}
//       {step === 3 && (
//         <div>
//           <Card className="mb-6">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>Your Reddit Post</CardTitle>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-muted-foreground">Posting to:</span>
//                   <Badge variant="secondary">{selectedSubreddit}</Badge>
//                 </div>
//               </div>
//               <CardDescription>Customize your post before sharing it on Reddit.</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex justify-between mb-2">
//                     <label className="text-sm font-medium">Tone:</label>
//                     <Select
//                       value={selectedTone}
//                       onValueChange={(value) => {
//                         if (showUpgradePrompt()) return
//                         setSelectedTone(value)
//                         handleGeneratePost()
//                       }}
//                     >
//                       <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Select tone" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="founder-story">Founder Story</SelectItem>
//                         <SelectItem value="feedback">Asking for Feedback</SelectItem>
//                         <SelectItem value="question">Question</SelectItem>
//                         <SelectItem value="free-tool">Free Tool Drop</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//
//                 <div>
//                   <div className="flex justify-between mb-2">
//                     <label className="text-sm font-medium">Title:</label>
//                     <Button variant="ghost" size="sm" onClick={() => copyToClipboard(postTitle)}>
//                       <Copy className="h-4 w-4 mr-1" />
//                       Copy
//                     </Button>
//                   </div>
//                   <Textarea value={postTitle} onChange={(e) => setPostTitle(e.target.value)} className="font-medium" />
//                 </div>
//
//                 <div>
//                   <div className="flex justify-between mb-2">
//                     <label className="text-sm font-medium">Body:</label>
//                     <Button variant="ghost" size="sm" onClick={() => copyToClipboard(postBody)}>
//                       <Copy className="h-4 w-4 mr-1" />
//                       Copy
//                     </Button>
//                   </div>
//                   <Textarea value={postBody} onChange={(e) => setPostBody(e.target.value)} rows={8} />
//                 </div>
//
//                 <div>
//                   <div className="flex justify-between mb-2">
//                     <label className="text-sm font-medium">TL;DR:</label>
//                     <Button variant="ghost" size="sm" onClick={() => copyToClipboard(postTldr)}>
//                       <Copy className="h-4 w-4 mr-1" />
//                       Copy
//                     </Button>
//                   </div>
//                   <Textarea value={postTldr} onChange={(e) => setPostTldr(e.target.value)} />
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter className="flex justify-between">
//               <Button variant="outline" onClick={() => setStep(2)}>
//                 Back
//               </Button>
//               <div className="flex space-x-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => copyToClipboard(`${postTitle}\n\n${postBody}\n\nTL;DR: ${postTldr}`)}
//                 >
//                   <Copy className="h-4 w-4 mr-2" />
//                   Copy Full Post
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     if (showUpgradePrompt()) return
//                     toast({
//                       title: "Success!",
//                       description: "Your post is ready to share on Reddit",
//                     })
//                   }}
//                 >
//                   <ThumbsUp className="h-4 w-4 mr-2" />
//                   Looks Good
//                 </Button>
//               </div>
//             </CardFooter>
//           </Card>
//
//           {usageCount >= 2 && (
//             <Card className="bg-primary/5 border-primary/20">
//               <CardContent className="flex items-center justify-between p-4">
//                 <div>
//                   <h3 className="font-medium">Upgrade for unlimited drafts</h3>
//                   <p className="text-sm text-muted-foreground">Get more tones, unlimited drafts, and export options</p>
//                 </div>
//                 <Button onClick={() => console.log("Upgrade clicked")}>Upgrade Now</Button>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       )}
//
//       <Toaster />
//     </div>
//   )
// }
