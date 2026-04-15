import "./characters.css"; 
export default function CharactersPage() { 
  return ( 
    <main className="content-page characters-page"> 
      <section className="content-hero"> 
        <p className="content-kicker">Character Study</p> 
      </section> 
      
      <section className="content-card-grid"> 
        <article className="newspaper"> 
          <p> </p> 
        </article> 
        
        <article className="char-info"> 
          <h1>The Returning Woman</h1> 
          <p className= "char"> The central figure is unnamed, which helps her become both individual and symbolic. She carries memory, longing, and disbelief as she revisits what once defined home. </p> 
          
          <h2>Identity and Presence</h2> 
          <p> She experiences the place as if she belongs to it, yet the living world does not recognize her. This creates tension between self-perception and social visibility. </p>
          
          <h2>Visual Representation</h2> 
          <p> A faded silhouette, translucent figure, or distant ghostly form can represent her. Use framing that keeps her near familiar spaces while still visually separated from them. </p> 
          
          <h2>Sound Design Direction</h2> 
          <p> Light wind, rustling leaves, and flowing water can heighten unease. Ambient audio should feel natural at first, then gradually become hollow and colder as she reaches the house. </p> 
        </article>

        <article className="char-info"> 
          <h1>The Unknowing Children</h1> 
          <p className= "char"> Two minor characters united as one enity that is meant to act as the mirror refelcting The Returning Woman's death and ultimately her into the realization that she has passed away.</p> 
          
          <h2>Identity and Presence</h2> 
          <p> The children represent the living world, their identity rooted in visibility and mutual recognition. Their presence contrasts with the returning woman’s invisibility, emphasizing the divide between those who exist within life and those who do not.</p>
          
          <h2>Visual Representation</h2> 
          <p>Two young, fair-skinned European children of similar age bring a childlike innocence to the narrative, countering its darker themes of death and colonization. </p> 
          
          <h2>Symbolism</h2> 
          <p>The children symbolise innocence and normalcy within the living world, their unawareness reinforcing the boundary between presence and absence. Their behaviour reflects the natural acceptance of life that excludes the returning woman. </p> 
        </article>
      </section> 
    </main> 
  ); 
}
